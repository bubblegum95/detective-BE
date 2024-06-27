import { IsString, IsNotEmpty, ValidateNested, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CareerDto } from './create-career.dto';
import { EquipmentDto } from './create-equipment.dto';
import { LicenseDto } from './create-licnese.dto';
import { RegionDto } from './create-region.dto';
import { CategoryDto } from './create-category.dto';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: '설명을 입력해주세요' })
  @ApiProperty({ example: 'test description', description: '설명' })
  description: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 1, description: '탐정 ID' })
  detectiveId?: number;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @ValidateNested()
  @Type(() => CareerDto)
  @ApiProperty({ type: CareerDto, description: '경력 정보' })
  career: CareerDto;

  @ValidateNested()
  @Type(() => LicenseDto)
  @ApiProperty({ type: LicenseDto, description: '자격증 정보' })
  license: LicenseDto;

  @ValidateNested()
  @Type(() => RegionDto)
  @IsNotEmpty()
  @ApiProperty({ type: RegionDto, description: '지역 정보' })
  region: RegionDto;

  @ValidateNested()
  @Type(() => CategoryDto)
  @IsNotEmpty()
  @ApiProperty({ type: CategoryDto, description: '카테고리 정보' })
  category: CategoryDto;

  @ValidateNested()
  @Type(() => EquipmentDto)
  @IsNotEmpty()
  @ApiProperty({ type: EquipmentDto, description: '장비 정보' })
  equipment: EquipmentDto;
}
