import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RegionEnum } from '../../region/type/region.type';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegionDto {
  @IsEnum(RegionEnum)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'jeju', description: '지역 이름' })
  name: RegionEnum;
}
