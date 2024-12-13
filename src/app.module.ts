import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { S3Module } from './s3/s3.module';
import { ConsultationModule } from './consultation/consultation.module';
import { ReviewModule } from './review/review.module';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ChatModule } from './chat/chat.module';
import { DetectiveofficeModule } from './office/detectiveoffice.module';
import { RedisModule } from './redis/redis.module';
import { NewsModule } from './news/news.module';
import { NotificationModule } from './notification/notification.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from 'config/winston.config';

const typeOrmModuleOptions = {
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(), // 자동으로 DB에 스네이프 (교수) 케이스로
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: configService.get('POSTGRES_SYNC'),
    logging: ['query', 'error'], // row query 출력
    retryAttempts: 5,
    retryDelay: 3000,
  }),
  inject: [ConfigService],
};

const MongooseModuleAsyncOptions = {
  useFactory: async (configService: ConfigService): Promise<MongooseModuleOptions> => ({
    uri: configService.get('MONGO_HOST'),
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    MongooseModule.forRootAsync(MongooseModuleAsyncOptions),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    UserModule,
    S3Module,
    DetectiveofficeModule,
    PostModule,
    UserModule,
    ConsultationModule,
    ReviewModule,
    ChatModule,
    RedisModule,
    NewsModule,
    NotificationModule,
  ],
  providers: [AppService],
  controllers: [AppController],
  exports: [],
})
export class AppModule {}
