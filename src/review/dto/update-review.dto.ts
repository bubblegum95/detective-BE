import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @IsString()
  @IsOptional()
  @ApiProperty({
    example: '이 탐정 믿을만하다.',
    description: '리뷰 내용',
    nullable: true,
  })
  comment?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    example: 1,
    description: '신뢰도',
    nullable: true,
  })
  reliability?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    example: 1,
    description: '속도',
    nullable: true,
  })
  speed?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    example: 1,
    description: '정확도',
    nullable: true,
  })
  accuracy?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    example: 1,
    description: '완성도',
    nullable: true,
  })
  completion?: number;
}
