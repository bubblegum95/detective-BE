import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
// import { GlobalExceptionsFilter } from './global-exception.filter';
import { S3Module } from './s3/s3.module';
import { DetectiveofficeModule } from './detectiveoffice/detectiveoffice.module';
import { ConsultationModule } from './consultation/consultation.module';
import { ReviewModule } from './review/review.module';
import { ChatModule } from './chat/chat.module';
import { configModuleValidationSchema } from '../configs/env.validation.config';
import { typeOrmModuleOptions } from '../configs/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationSchema,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    UserModule,
    S3Module,
    DetectiveofficeModule,
    PostModule,
    UserModule,
    AuthModule,
    ConsultationModule,
    ReviewModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_FILTER,
    //   useClass: GlobalExceptionsFilter,
    // },
  ],
})
export class AppModule {}
