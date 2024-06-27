import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Detective } from '../user/entities/detective.entity';
import { S3Module } from '../s3/s3.module';
import { HttpModule } from '@nestjs/axios';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy],
  imports: [
    UserModule,
    S3Module,
    HttpModule,
    PassportModule,
    TypeOrmModule.forFeature([User, Detective, File]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_SECRET'),
        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),
  ],
  exports: [JwtModule, JwtService],
})
export class AuthModule {}
