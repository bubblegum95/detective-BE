import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateCategoryDto } from './create-category.dto';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CategoryEnum } from '../type/category.type';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsEnum(CategoryEnum)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'FamilyLaw', description: '카테고리 이름' })
  name: CategoryEnum;
}
