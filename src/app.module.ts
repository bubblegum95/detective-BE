import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { PostModule } from './post/post.module';
import { DetectivePost } from './post/entities/post.entity';

const typeOrmModuleOptions = {
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(), // 자동으로 DB에 스네이프 케이스로
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),
    entities: [DetectivePost],
    synchronize: configService.get('POSTGRES_SYNC'),
    logging: true, // row query 출력
  }),
  inject: [ConfigService],
};
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    PostModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
