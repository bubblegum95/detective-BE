import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateDetectiveDto } from './create-detective.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDetectiveDto extends PartialType(CreateDetectiveDto) {
  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    nullable: true,
    example: '내가 제일 잘 나가.',
    description: '한 줄 소개',
  })
  subject?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: 'string',
    nullable: true,
    example: '무슨 고민이든 척척 이 명탐정이 해결해드립니다.',
  })
  intro?: string;
}
