import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOfficeDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    description: '사업장 주소',
    example: '바뀐 사업장 주소지',
    required: false,
  })
  address?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    description: '사업장 상세 주소',
    example: '하온빌라 2층',
    required: false,
  })
  addressDetail?: string;

  @IsString()
  @MaxLength(12)
  @IsOptional()
  @ApiProperty({
    type: 'string',
    description: '탐정사무소 연락처',
    example: '021231234',
    required: false,
  })
  phone?: string;
}
