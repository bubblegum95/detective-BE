import { Module } from '@nestjs/common';
import { DetectiveofficeService } from './detectiveoffice.service';
import { DetectiveofficeController } from './detectiveoffice.controller';

@Module({
  controllers: [DetectiveofficeController],
  providers: [DetectiveofficeService],
})
export class DetectiveofficeModule {}
