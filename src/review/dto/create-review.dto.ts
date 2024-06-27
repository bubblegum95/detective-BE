import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewDTO {
  @IsString()
  // @IsEmpty({ message: '댓글을 입력해주세요.' })
  @ApiProperty({
    example: '이 탐정 믿을만하다.',
    description: '리뷰 내용',
  })
  comment: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty({
    example: 1,
    description: '평점',
  })
  reliability: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty({
    example: 1,
    description: '평점',
  })
  speed: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty({
    example: 1,
    description: '평점',
  })
  accuracy: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty({
    example: 1,
    description: '평점',
  })
  completion: number;
}
