import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimStringPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      return value.trim(); // 문자열에 대해서만 trim 적용
    }
    if (Array.isArray(value)) {
      return value.map((v) => (typeof v === 'string' ? v.trim() : v)); // 배열의 경우 각 원소에 대해 trim
    }
    if (value && typeof value === 'object') {
      // 객체 내의 각 필드에 대해서 trim 적용
      for (const key in value) {
        if (value[key] && typeof value[key] === 'string') {
          value[key] = value[key].trim();
        }
      }
    }
    return value;
  }
}
