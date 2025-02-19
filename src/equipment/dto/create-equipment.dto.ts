import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EquipmentEnum } from '../../equipment/type/equipment.type';

export class CreateEquipmentDto {
  @IsEnum(EquipmentEnum)
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Mobility', description: '장비 이름' })
  name: EquipmentEnum;
}
