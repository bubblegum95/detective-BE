import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}
}
