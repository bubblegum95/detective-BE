import { Transform } from 'class-transformer';
import { findQueryKeyType } from '../type/find-query-key.type';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindQueryDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: '아이템 조회 페이지', example: 1, nullable: false })
  page: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: '아이템 조회 개수', example: 10, nullable: false })
  limit: number;

  @IsEnum(findQueryKeyType)
  @IsOptional()
  @ApiProperty({ description: '아이템 조회 키워드', enum: findQueryKeyType, nullable: true })
  key: findQueryKeyType;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: '아이템 조회값', example: 1, nullable: true })
  value: number;
}
