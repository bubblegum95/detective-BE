import { Body, Controller, Post } from '@nestjs/common';
import { DetectiveofficeService } from './detectiveoffice.service';
import { CreateDetectiveOfficeDto } from './dto/create-office.dto';
import { DetectiveOffice } from './entities/detective-office.entity';

@Controller('detectiveoffice')
export class DetectiveofficeController {
  constructor(private readonly detectiveofficeService: DetectiveofficeService) {}

  @Post()
  create(@Body() createDetectiveOfficeDto: CreateDetectiveOfficeDto): Promise<DetectiveOffice> {
    return this.detectiveofficeService.createDetectiveOffice(createDetectiveOfficeDto);
  }
}
