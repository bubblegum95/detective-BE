import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser, { signedCookie } from 'cookie-parser';
import { Server } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RedisIoAdapter } from './redis/redis-io.adapter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const winstonLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(winstonLogger);

  const logger = new Logger(bootstrap.name);

  const configService = app.get(ConfigService);
  const option = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };

  const config = new DocumentBuilder()
    .setTitle('Detective Project')
    .setDescription('Detective Brokerage Platform Service')
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
  const clientPort = configService.get<number>('CLIENT_PORT');
  app.enableCors({
    origin: `http://127.0.0.1:${clientPort}`,
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
  const socketPort = configService.get<number>('SOCKET_PORT');
  const redisIoAdapter = new RedisIoAdapter(app, socketPort);
  const redisHost = configService.get<string>('REDIS_HOST');
  const redisPort = configService.get<number>('REDIS_PORT');
  await redisIoAdapter.connectToRedis(redisHost, redisPort);
  app.useWebSocketAdapter(redisIoAdapter);

  //Http 서버 시작
  const port = configService.get<number>('SERVER_PORT');
  await app.listen(port);
  winstonLogger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');

  // 마이크로서비스 설정
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: redisHost,
      port: redisPort,
    },
  });

  // 마이크로서비스 시작
  await app.startAllMicroservices();
  logger.log('Microservice is listening');
}
bootstrap();
