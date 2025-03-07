import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, ValidateNested } from 'class-validator';
import { CreateConsumerDto } from './create-consumer.dto';
import { Transform, Type } from 'class-transformer';

export class CreateEmployeeDto {
  @ValidateNested()
  @Type(() => CreateConsumerDto)
  @ApiProperty({ description: '유저 정보', type: CreateConsumerDto })
  user: CreateConsumerDto;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({ description: '탐정 사무소 id', example: 1, type: 'number' })
  officeId: number;
}
