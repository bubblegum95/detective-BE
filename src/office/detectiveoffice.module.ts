import { Module } from '@nestjs/common';
import { DetectiveofficeService } from './detectiveoffice.service';
import { DetectiveofficeController } from './detectiveoffice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectiveOffice } from './entities/detective-office.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetectiveOffice])],
  controllers: [DetectiveofficeController],
  providers: [DetectiveofficeService],
})
export class DetectiveofficeModule {}
