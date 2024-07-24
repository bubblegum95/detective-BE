import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
<<<<<<< HEAD
import cookieParser, { signedCookie } from 'cookie-parser';
import { Server } from 'socket.io';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { RedisIoAdapter } from './redis/redis-io-adapter';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false, // 기본 로거를 비활성화! winston으로 사용할거임
  });
  const winstonLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(winstonLogger);

=======
import cookieParser from 'cookie-parser';
import { RedisIoAdapter } from './redis/redis-io.adapter';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger(bootstrap.name);
  const app = await NestFactory.create(AppModule);
>>>>>>> 41d0aad6cc4e410a9a80d00a0440cdb1b502ec8d
  const configService = app.get(ConfigService);
  const port = configService.get<number>('SERVER_PORT');
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

  app.enableCors({
    origin: 'http://127.0.0.1:3001',
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
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  //Http 서버 시작
  await app.listen(port);
<<<<<<< HEAD
  winstonLogger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');
=======

  // 마이크로서비스 설정
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: 'localhost',
      port: 6379,
    },
  });

  // 마이크로서비스 시작
  await app.startAllMicroservices();
  logger.log('Microservice is listening');
>>>>>>> 41d0aad6cc4e410a9a80d00a0440cdb1b502ec8d
}
bootstrap();
