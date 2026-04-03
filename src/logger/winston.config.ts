/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { WinstonModuleOptions, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Transport for general application logs
const applicationLogTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d', // Keep logs for 14 days
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(), // JSON format is best for log parsing tools like Datadog/ELK
  ),
});

// Transport specifically for error logs
const errorLogTransport = new DailyRotateFile({
  level: 'error',
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d', // Keep error logs for 30 days
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
});

export const winstonConfig: WinstonModuleOptions = {
  transports: [
    // Console transport for local development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('MyApp', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
    applicationLogTransport,
    errorLogTransport,
  ],
};
