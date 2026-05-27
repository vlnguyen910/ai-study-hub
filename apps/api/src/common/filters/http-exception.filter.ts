import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseDto } from '../dtos/response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Lấy message từ exception
    let message = 'Lỗi xảy ra';

    if (typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;
      message =
        responseObj.message ||
        (Array.isArray(responseObj.message)
          ? responseObj.message.join(', ')
          : message);
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    // Log lỗi
    this.logger.error(
      `Status: ${status}, Message: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    // Trả về ResponseDto format
    response.status(status).json(new ResponseDto(false, status, message, null));
  }
}
