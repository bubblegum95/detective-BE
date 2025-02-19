import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateLicenseDto } from './create-license.dto';

export class UpdateLicenseDto extends PartialType(CreateLicenseDto) {
  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true, type: 'string', description: '라이선스 발행일자' })
  issueAt?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true, type: 'string', description: '발행기관' })
  issueBy?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ nullable: true, type: 'string', description: '라이선스 명' })
  title?: string;
}
