import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RedisIoAdapter } from './socket/redis-io-adapter';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    const winstonLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
    app.useLogger(winstonLogger);

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
          in: 'cookies',
        },
        'authorization',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, option);
    const CLIENT_HOST = configService.get<string>('CLIENT_HOST');
    const CLIENT_PORT = configService.get<number>('CLIENT_PORT');
    app.enableCors({
      origin: [`http://${CLIENT_HOST}:${CLIENT_PORT}`, `http://127.0.0.1:${CLIENT_PORT}`],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    // websocket adapter 설정
    const SOCKET_PORT = configService.get<number>('SOCKET_PORT');
    const REDIS_HOST = configService.get<string>('REDIS_HOST');
    const REDIS_PORT = configService.get<number>('REDIS_PORT');

    const redisIoAdapter = new RedisIoAdapter(app);
    await redisIoAdapter.connectToRedis(REDIS_HOST, REDIS_PORT);

    app.useWebSocketAdapter(redisIoAdapter);

    //Http 서버 시작
    const SERVER_PORT = configService.get<number>('SERVER_PORT');
    await app.listen(SERVER_PORT);

    // 마이크로서비스 설정
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.REDIS,
      options: {
        host: REDIS_HOST,
        port: REDIS_PORT,
        wildcards: true,
      },
    });

    // 마이크로서비스 시작
    await app.startAllMicroservices();
  } catch (error) {
    console.error('Unhandled error during application initialization:', error);
  }
}

bootstrap();
