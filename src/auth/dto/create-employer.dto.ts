import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { CreateConsumerDto } from './create-consumer.dto';
import { CreateOfficeDto } from '../../office/dto/create-office.dto';
import { plainToInstance, Type } from 'class-transformer';

export class CreateEmployerDto {
  @ApiProperty({ description: '유저 생성 정보', type: CreateConsumerDto })
  user: CreateConsumerDto;

  @ApiProperty({ description: '오피스 생성 정보', type: CreateOfficeDto })
  office: CreateOfficeDto;

  @ApiProperty({ type: 'string', format: 'binary', description: '사업자등록증 이미지 파일' })
  file: any;
}
