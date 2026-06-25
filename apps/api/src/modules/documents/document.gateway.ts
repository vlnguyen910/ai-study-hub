import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
  namespace: '/documents',
})
export class DocumentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(DocumentGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validate the connecting socket's JWT token.
   * Only MODERATOR and ADMIN roles are allowed to join the moderator room.
   */
  handleConnection(client: Socket): void {
    try {
      const token =
        (client.handshake.auth as { token?: string }).token ??
        (client.handshake.headers.authorization ?? '').replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without a token`);
        client.disconnect();
        return;
      }

      const jwtSecret = this.configService.get<string>('jwt.secret');
      const payload = this.jwtService.verify<{ role: UserRole }>(token, {
        secret: jwtSecret,
      });

      if (
        payload.role !== UserRole.MODERATOR &&
        payload.role !== UserRole.ADMIN
      ) {
        this.logger.warn(
          `Client ${client.id} with role ${payload.role} is not authorized`,
        );
        client.disconnect();
        return;
      }

      // Join the shared moderator room so we can broadcast to all moderators at once
      void client.join('moderators');
      this.logger.log(
        `Moderator/Admin ${client.id} (role: ${payload.role}) connected`,
      );
    } catch (err) {
      this.logger.warn(
        `Client ${client.id} disconnected — invalid token: ${(err as Error).message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client ${client.id} disconnected`);
  }

  /**
   * Broadcast a new pending document event to all connected moderators/admins.
   */
  broadcastDocumentCreated(document: {
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    author: { name: string; avatarUrl: string | null };
  }): void {
    this.server.to('moderators').emit('document_created', document);
    this.logger.log(
      `Broadcasted document_created for document: ${document.id}`,
    );
  }
}
