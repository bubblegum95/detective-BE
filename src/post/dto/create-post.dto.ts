import { IsNotEmpty, IsString } from 'class-validator';
import { CreateLicenseDto } from './create-licnese.dto';
import { CreateCareerDto } from './create-career.dto';
import { CreateCategoryDto } from './create-category.dto';
import { CreateEquipmentDto } from './create-equipment.dto';
import { CreateRegionDto } from './create-region.dto';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  readonly description: string;
  // profileFile: CreateFileDto;
  detectiveId: number;
  career: CreateCareerDto;
  license: CreateLicenseDto;
  region: CreateRegionDto;
  category: CreateCategoryDto;
  equipment: CreateEquipmentDto;
}
