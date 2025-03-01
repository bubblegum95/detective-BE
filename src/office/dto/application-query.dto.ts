import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ApplicationQueryDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '아이템 수', example: 10 })
  limit: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '페이지', example: 1 })
  page: number;
}
