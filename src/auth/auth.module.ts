import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Detective } from '../user/entities/detective.entity';
import { S3Module } from '../s3/s3.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule, S3Module, HttpModule, TypeOrmModule.forFeature([User, Detective])],
})
export class AuthModule {}
