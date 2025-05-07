import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { RedisIoAdapter } from './socket/redis-io-adapter';
import { HttpExceptionFilter } from './utils/filter/http-exception.filter';
import { TrimStringPipe } from './utils/pipes/trim-string.pipe';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const winstonLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
    app.useLogger(winstonLogger);
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new TrimStringPipe(),
      new ValidationPipe({
        transform: true,
        whitelist: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    const configService = app.get(ConfigService);
    const option = {
      swaggerOptions: {
        persistAuthorization: true,
      },
    };

    const config = new DocumentBuilder()
      .setTitle('Detective Project')
      .setDescription('Detective Office Brokerage Platform Service')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          name: 'JWT',
          in: 'header',
        },
        'authorization',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, option);
    const CLIENT_HOST = configService.get<string>('CLIENT_HOST');
    const CLIENT_PORT = configService.get<number>('CLIENT_PORT');

    app.enableCors({
      origin: [
        `http://${CLIENT_HOST}:${CLIENT_PORT}`,
        `http://127.0.0.1:${CLIENT_PORT}`,
        'https://bubblegum.xn--3e0b707e',
      ],
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: ['Content-Type', 'authorization'],
    });

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // websocket / adapter 설정
    const REDIS_HOST = configService.get<string>('REDIS_HOST');
    const REDIS_PORT = configService.get<number>('REDIS_PORT');

    const adapter = new RedisIoAdapter(app);
    await adapter.connectToRedis(REDIS_HOST, REDIS_PORT);
    app.useWebSocketAdapter(adapter);

    //Http 서버 포트
    const SERVER_PORT = configService.get<number>('SERVER_PORT');
    await app.listen(SERVER_PORT);
  } catch (error) {
    console.error('Unhandled error during application initialization:', error);
  }
}

bootstrap();
