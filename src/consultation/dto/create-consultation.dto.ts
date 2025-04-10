import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateConsultationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({ example: '상담 제목', description: '상담 제목' })
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  @ApiProperty({ example: '구체적인 상담 내용', description: '구체적인 상담 내용' })
  content: string;
}
