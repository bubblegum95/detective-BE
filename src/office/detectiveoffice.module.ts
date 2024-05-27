import { Module } from '@nestjs/common';
import { OfficeService } from './detectiveoffice.service';
import { OfficeController } from './detectiveoffice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Owner } from './entities/owner.entity';
import { DetectiveOffice } from './entities/detective-office.entity';
import { Location } from './entities/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Owner, DetectiveOffice, Location])],
  controllers: [OfficeController],
  providers: [OfficeService],
})
export class OfficeModule {}
