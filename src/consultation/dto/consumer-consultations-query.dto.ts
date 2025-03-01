import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ConsumerConsultationsQueryDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: '조회할 페이지' })
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 10, description: '조회할 아이템 수' })
  limit: number;
}
