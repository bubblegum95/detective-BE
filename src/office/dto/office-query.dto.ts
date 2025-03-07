import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class OfficeQueryDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '사무실 명', example: '퐁식이네' })
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: '페이지', example: 1 })
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: '아이템 수', example: 10 })
  limit: number;
}
