import { Controller } from '@nestjs/common';
import { DetectiveofficeService } from './detectiveoffice.service';

@Controller('detectiveoffice')
export class DetectiveofficeController {
  constructor(private readonly detectiveofficeService: DetectiveofficeService) {}
}
