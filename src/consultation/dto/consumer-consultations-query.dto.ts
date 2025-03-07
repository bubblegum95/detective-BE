import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ConsumerConsultationsQueryDto {
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ example: 1, description: '조회할 페이지' })
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ example: 10, description: '조회할 아이템 수' })
  limit: number;
}
