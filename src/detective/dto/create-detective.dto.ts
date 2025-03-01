import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDetectiveDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '탐정 한 줄 소개', example: '내 이름은 코난. 탐정이죠.' })
  subject: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: '탐정 한 줄 소개', example: '내 소개를 하지.' })
  intro: string;
}
