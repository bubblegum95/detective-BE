import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'jeju', description: '지역 이름' })
  name: string;
}
