import { IsDateString, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CareerDto {
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ example: '2023-01-01', description: '시작 날짜' })
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({ example: '2024-01-01', description: '종료 날짜' })
  endDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '경력 내용', description: '경력 세부 사항' })
  businessDetails: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '회사 이름', description: '회사 이름' })
  corporateName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '직책', description: '직책' })
  position: string;
}
