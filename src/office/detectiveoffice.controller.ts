import { Controller, Get, Query } from '@nestjs/common';
import { DetectiveofficeService } from './detectiveoffice.service';

@Controller('offices')
export class DetectiveofficeController {
  constructor(private readonly officeService: DetectiveofficeService) {}
  @Get('')
  async findOfficeByKeyword(@Query('key') key: string) {
    return await this.officeService.findOfficeByKeyword(key);
  }
}
