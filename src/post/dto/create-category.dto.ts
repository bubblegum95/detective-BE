import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CategoryEnum } from '../type/category.type';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryDto {
  @IsEnum(CategoryEnum)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'FamilyLaw', description: '카테고리 이름' })
  name: string;
}
