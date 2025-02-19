import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOfficeDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '서울특별시 중구난방1길 30',
    description: '사업장 주소',
  })
  address: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '하온빌딩 2층 201호',
    description: '사업장 상세 주소',
  })
  addressDetail: string;

  @IsString()
  @MaxLength(10)
  @MinLength(10)
  @IsNotEmpty()
  @ApiProperty({
    example: '0000000000',
    description: '사업자등록번호',
  })
  businessNum: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'YYYYMMDD',
    description: '설립일자',
  })
  founded: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '퐁식이네',
    description: '기업이름',
  })
  name: string;
}
