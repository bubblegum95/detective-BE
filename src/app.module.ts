import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { PostModule } from './post/post.module';
import { DetectivePost } from './post/entities/detective-post.entity';
import { Region } from './post/entities/region.entity';
import { Equipment } from './post/entities/equipment.entity';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { Category } from './post/entities/category.entity';
import { License } from './post/entities/license.entity';
import { Career } from './post/entities/career.entity';

const typeOrmModuleOptions = {
  useFactory: async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(), // 자동으로 DB에 스네이프 케이스로
    type: 'postgres',
    host: configService.get('POSTGRES_HOST'),
    port: configService.get('POSTGRES_PORT'),
    username: configService.get('POSTGRES_USER'),
    password: configService.get('POSTGRES_PASSWORD'),
    database: configService.get('POSTGRES_DB'),
    entities: [DetectivePost, Region, Equipment, Category, License, Career],
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
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
