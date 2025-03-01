import { Module } from '@nestjs/common';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { License } from './entities/license.entity';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [LicenseController],
  providers: [LicenseService],
  imports: [TypeOrmModule.forFeature([License]), UserModule],
})
export class LicenseModule {}
