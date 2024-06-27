import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LicenseDto {
  @IsDateString()
  @ApiProperty({ example: '2023-01-01', description: '발급 날짜' })
  issuedAt: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '발급 기관', description: '발급 기관' })
  issuedBy: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '자격증 이름', description: '자격증 이름' })
  title: string;
}
