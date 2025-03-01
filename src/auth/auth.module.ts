import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { S3Module } from '../s3/s3.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../utils/strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { File } from '../s3/entities/s3.entity';
import { Detective } from '../detective/entities/detective.entity';
import { Office } from '../office/entities/office.entity';
import { OfficeModule } from '../office/office.module';
import { RoleModule } from '../role/role.module';
import { ChatModule } from '../chat/chat.module';
import { EmailModule } from '../mail/email.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, JwtStrategy, JwtAuthGuard],
  imports: [
    UserModule,
    OfficeModule,
    RoleModule,
    S3Module,
    PassportModule,
    ChatModule,
    EmailModule,
    RedisModule,
    TypeOrmModule.forFeature([User, Detective, File, Office]),
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
