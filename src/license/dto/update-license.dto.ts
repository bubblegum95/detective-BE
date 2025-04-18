import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateLicenseDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: '발행일자', required: false })
  issueAt?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '발행기관', required: false })
  issueBy?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: '라이선스 명', required: false })
  title?: string;
}
