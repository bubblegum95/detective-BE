import { PartialType } from '@nestjs/mapped-types';
import { CreateConsultationDto } from './create-consultation.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateConsultationDto extends PartialType(CreateConsultationDto) {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  subject?: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  content?: string;
}
