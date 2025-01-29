import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Detective } from '../user/entities/detective.entity';
import { S3Module } from '../s3/s3.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../utils/strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { DetectiveOffice } from '../office/entities/detective-office.entity';
import { File } from '../s3/entities/s3.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy, JwtAuthGuard],
  imports: [
    UserModule,
    S3Module,
    PassportModule,
    TypeOrmModule.forFeature([User, Detective, File, DetectiveOffice]),
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
