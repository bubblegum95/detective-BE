import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RegionEnum } from '../type/region.type';
import { CategoryEnum } from '../type/category.type';
import { EquipmentEnum } from '../type/equiment.type';

class CareerDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  businessDetails: string;

  @IsString()
  @IsNotEmpty()
  corporateName: string;

  @IsString()
  @IsNotEmpty()
  position: string;
}

class LicenseDto {
  @IsDateString()
  issuedAt: string;

  @IsString()
  @IsNotEmpty()
  issuedBy: string;

  @IsString()
  @IsNotEmpty()
  title: string;
}

class RegionDto {
  @IsEnum(RegionEnum)
  @IsString()
  @IsNotEmpty()
  name: string;
}

class CategoryDto {
  @IsEnum(CategoryEnum)
  @IsString()
  @IsNotEmpty()
  name: string;
}

class EquipmentDto {
  @IsEnum(EquipmentEnum)
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  // @IsNumber()
  // profileFileId: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  detectiveId?: number;

  @ValidateNested()
  @Type(() => CareerDto)
  career: CareerDto;

  @ValidateNested()
  @Type(() => LicenseDto)
  license: LicenseDto;

  @ValidateNested()
  @Type(() => RegionDto)
  region: RegionDto;

  @ValidateNested()
  @Type(() => CategoryDto)
  category: CategoryDto;

  @ValidateNested()
  @Type(() => EquipmentDto)
  equipment: EquipmentDto;
}
