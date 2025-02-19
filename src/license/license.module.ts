import { Module } from '@nestjs/common';
import { LicenseService } from './license.service';
import { LicenseController } from './license.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { License } from './entities/license.entity';

@Module({
  controllers: [LicenseController],
  providers: [LicenseService],
  imports: [TypeOrmModule.forFeature([License])],
})
export class LicenseModule {}
