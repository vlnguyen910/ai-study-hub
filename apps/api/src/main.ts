import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { getAppConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { appPort, corsOrigins } = getAppConfig();

  // WebSocket adapter (Socket.io)
  app.useWebSocketAdapter(new IoAdapter(app));

  // Enable API Versioning (URI versioning: /api/v1, /api/v2, etc.)
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api/v',
  });

  // Cookie Parser Middleware
  app.use(cookieParser());

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );

  // CORS enables
  // corsOrigins is either:
  // - true (development: allow all origins)
  // - string[] (production: specific allowed origins)
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins === true) {
        callback(null, true);
        return;
      }

      if (Array.isArray(corsOrigins)) {
        const isAllowed = corsOrigins.some((allowedOrigin) => {
          if (allowedOrigin === origin) return true;
          if (allowedOrigin.includes('*')) {
            const regexPattern =
              '^' +
              allowedOrigin.replace(/\./g, '\\.').replace(/\*/g, '.*') +
              '$';
            const regex = new RegExp(regexPattern);
            return regex.test(origin);
          }
          return false;
        });

        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  await app.listen(appPort ?? 8080);
}
void bootstrap();
