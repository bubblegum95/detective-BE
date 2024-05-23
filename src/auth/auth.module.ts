import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Detective } from '../user/entities/detective.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule, TypeOrmModule.forFeature([User, Detective])],
})
export class AuthModule {}
