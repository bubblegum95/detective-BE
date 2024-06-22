import { Body, Controller, Post } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDTO } from './dto/create-review.dto';
import { Review } from './entities/review.entity';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('')
  writeReview(@Body() createReviewDTO: CreateReviewDTO) {
    return this.reviewService.writeReview(createReviewDTO);
  }
}
