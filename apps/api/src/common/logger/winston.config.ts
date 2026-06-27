import { format, transports } from 'winston';
import { WinstonModule } from 'nest-winston';
import WinstonDailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';

export const createWinstonLogger = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Format definitions
  const consoleFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.colorize(),
    format.printf(({ timestamp, level, message, context, stack }) => {
      const contextStr = context ? `[${context}] ` : '';
      const stackStr = stack ? `\n${stack}` : '';
      return `${timestamp} ${level}: ${contextStr}${message}${stackStr}`;
    }),
  );

  const jsonFormat = format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  );

  // Transports definition
  const loggerTransports: any[] = [
    new transports.Console({
      format: isProduction ? jsonFormat : consoleFormat,
      level: isProduction ? 'info' : 'debug',
    }),
  ];

  // In production, we also log to daily rotate files
  if (isProduction) {
    loggerTransports.push(
      new WinstonDailyRotateFile({
        dirname: path.join(process.cwd(), 'logs'),
        filename: 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'info',
        format: jsonFormat,
      }),
      new WinstonDailyRotateFile({
        dirname: path.join(process.cwd(), 'logs'),
        filename: 'error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        format: jsonFormat,
      }),
    );
  }

  return WinstonModule.createLogger({
    transports: loggerTransports,
  });
};
