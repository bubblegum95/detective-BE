import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export const winstonConfig: WinstonModuleOptions = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    // 콘솔 로그
    // new winston.transports.Console({
    //   format: winston.format.combine(
    //     winston.format.timestamp(),
    //     winston.format.colorize(),
    //     winston.format.simple(),
    //   ),
    // }),
    // 일반 로그 파일
    new DailyRotateFile({
      filename: './logs/app-log/info/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      level: 'info',
    }),
    // 에러 로그 파일
    new DailyRotateFile({
      filename: './logs/app-log/error/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      level: 'error',
    }),
  ],
  // 예외 처리 (추후 수정)
  // exceptionHandlers: [
  //   new DailyRotateFile({
  //     filename: './logs/exceptions/exceptions-%DATE%.log',
  //     datePattern: 'YYYY-MM-DD',
  //     zippedArchive: true,
  //     maxSize: '20m',
  //     maxFiles: '14d',
  //     format: winston.format.combine(
  //       winston.format.timestamp(),
  //       winston.format.json()
  //     ),
  //   }),
  // ],
};
