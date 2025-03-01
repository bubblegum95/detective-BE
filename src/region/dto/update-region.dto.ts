import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRegionDto } from './create-region.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateRegionDto extends PartialType(CreateRegionDto) {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '지역명', example: 'jeju' })
  name: string;
}
