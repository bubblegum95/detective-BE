import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCareerDto } from './create-career.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateCareerDto extends PartialType(CreateCareerDto) {
  @IsDateString()
  @IsOptional()
  @ApiProperty({ example: '2023-01-01', description: '시작 날짜', nullable: true })
  startDate?: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({ example: '2024-01-01', description: '종료 날짜', nullable: true })
  endDate?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '경력 내용', description: '경력 세부 사항', nullable: true })
  businessDetails?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '회사 이름', description: '회사 이름', nullable: true })
  corporateName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '직책', description: '직책', nullable: true })
  position?: string;
}
