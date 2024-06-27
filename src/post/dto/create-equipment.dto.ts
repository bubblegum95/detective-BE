import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EquipmentEnum } from '../type/equipment.type';

export class EquipmentDto {
  @IsEnum(EquipmentEnum)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Mobility', description: '장비 이름' })
  name: EquipmentEnum;
}
