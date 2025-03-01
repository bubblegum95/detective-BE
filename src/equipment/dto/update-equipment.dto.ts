import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateEquipmentDto } from './create-equipment.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEquipmentDto extends PartialType(CreateEquipmentDto) {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Mobility', description: '장비 이름' })
  name: string;
}
