import { Transform } from 'class-transformer';
import { findQueryKeyType } from '../type/find-query-key.type';
import { IsNumber } from 'class-validator';

export class FindQueryDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit: number;

  key: findQueryKeyType;

  value: string;
}
