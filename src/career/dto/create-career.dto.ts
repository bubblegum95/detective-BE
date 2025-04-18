import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCareerDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '근무사', description: '회사 이름' })
  company: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '직무', description: '직무' })
  job: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '직책', description: '직책' })
  position: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ example: '2023-01-01', description: '시작 날짜' })
  start: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ example: '2024-01-01', description: '종료 날짜' })
  end: string;
}
