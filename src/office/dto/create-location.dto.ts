import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LocationDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: '127.02758', description: '경도(경찰과 도둑 아님)' })
  longitude: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: '37.49794', description: '위도' })
  latitude: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '허리도 가늘군 만지면 부러지리', description: '주소' })
  address: string;
}
