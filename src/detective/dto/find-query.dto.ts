import { findQueryKeyType } from '../type/find-query-key.type';

export class FindQueryDto {
  page: number;
  limit: number;
  key: findQueryKeyType;
  value: string;
}
