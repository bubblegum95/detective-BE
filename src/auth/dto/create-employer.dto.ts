import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateConsumerDto } from './create-consumer.dto';
import { Type } from 'class-transformer';
import { CreateOfficeDto } from '../../office/dto/create-office.dto';

export class CreateEmployerDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CreateConsumerDto)
  @ApiProperty({ description: '유저 생성 정보', type: CreateConsumerDto })
  user: CreateConsumerDto;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateOfficeDto)
  @ApiProperty({ description: '유저 생성 정보', type: CreateOfficeDto })
  office: CreateOfficeDto;

  @ApiProperty({ type: 'string', format: 'binary', description: '사업자등록증 이미지 파일' })
  file: any;
}
