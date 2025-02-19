import { Module } from '@nestjs/common';
import { OfficeService } from './office.service';
import { OfficeController } from './office.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Office } from './entities/office.entity';
import { RedisModule } from '../redis/redis.module';
import { EmailModule } from '../mail/email.module';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [OfficeController],
  providers: [OfficeService],
  exports: [OfficeService],
  imports: [RedisModule, EmailModule, UserModule, TypeOrmModule.forFeature([Office])],
})
export class OfficeModule {}
