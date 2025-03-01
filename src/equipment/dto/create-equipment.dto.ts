import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Mobility', description: '장비 이름' })
  name: string;
}
