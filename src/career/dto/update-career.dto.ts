import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCareerDto } from './create-career.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateCareerDto extends PartialType(CreateCareerDto) {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: '회사 이름', description: '회사 이름', nullable: true })
  company?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '직책', description: '직책', nullable: true })
  position?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '직무', description: '직무', nullable: true })
  job?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '2023-01-01', description: '시작 날짜', nullable: true })
  start?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '2024-01-01', description: '종료 날짜', nullable: true })
  end?: string;
}
