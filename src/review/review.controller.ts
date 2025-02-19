import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { UserInfo } from 'src/utils/decorators/decorator';
import { User } from 'src/user/entities/user.entity';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { FindReviewsQueryDto } from './dto/find-reviews-query.dto';
import { Response } from 'express';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':postId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '리뷰 작성', description: '리뷰 작성 입니다' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: CreateReviewDto })
  @Transform(({ value }) => parseInt(value))
  writeReview(
    @Param('postId') postId: number,
    @Body() dto: CreateReviewDto,
    @UserInfo() user: User,
  ) {
    return this.reviewService.createReview(user, postId, dto);
  }

  @Get(':postId')
  async findAll(@Query() query: FindReviewsQueryDto, @Res() res: Response) {
    try {
      const take = query.limit;
      const skip = (query.page - 1) * take;
      const reviews = await this.reviewService.findAll(query.postId, skip, take);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '리뷰를 조회합니다.',
        data: reviews,
      });
    } catch (error) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: '리뷰를 조회할 수 없습니다.',
        data: error.message,
      });
    }
  }
}
