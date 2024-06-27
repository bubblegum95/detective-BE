import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { LocationDto } from './create-location.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDetectiveOfficeDto {
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsString()
  @ApiProperty({ example: 'ㅎㅇ', description: '설명' })
  description?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '오다은', description: '이름' })
  name?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '설립일', description: '3005년 4월 11일' })
  founded: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '1020203030', description: '사업자 등록 번호' })
  businessRegistrationNum?: string;

  @ValidateNested()
  @Type(() => LocationDto)
  @ApiProperty({ type: LocationDto, description: '위치 정보' })
  location: LocationDto;
}
