import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '이 탐정 믿을만하다.',
    description: '리뷰 내용',
  })
  comment: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    example: 1,
    description: '신뢰도',
  })
  reliability: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    example: 1,
    description: '속도',
  })
  speed: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    example: 1,
    description: '정확도',
  })
  accuracy: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    example: 1,
    description: '완성도',
  })
  completion: number;
}
