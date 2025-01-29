import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDTO } from './dto/create-review.dto';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { UserInfo } from 'src/utils/decorators/decorator';
import { User } from 'src/user/entities/user.entity';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

@ApiTags('Review')
@Controller('posts')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/:postId/review')
  @ApiOperation({ summary: '리뷰 작성', description: '리뷰 작성 입니다' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: CreateReviewDTO })
  @Transform(({ value }) => parseInt(value))
  @ApiParam({ type: 'number', name: '파라미터', example: 1 })
  writeReview(
    @Param('postId') postId: number,
    @Body() createReviewDTO: CreateReviewDTO,
    @UserInfo() user: User,
  ) {
    return this.reviewService.writeReview(createReviewDTO, user.id, postId);
  }
}
