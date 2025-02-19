import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class FindReviewsQueryDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '탐정 프로필 id', example: 1 })
  postId: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '리뷰 조회 페이지네이션', example: 1 })
  page: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ description: '리뷰 아이템 개수', example: 10 })
  limit: number;
}
