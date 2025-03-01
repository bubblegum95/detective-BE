import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { UserInfo } from 'src/utils/decorators/decorator';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindReviewsQueryDto } from './dto/find-reviews-query.dto';
import { Response } from 'express';
import { HttpExceptionFilter } from '../utils/filter/http-exception.filter';
import { UpdateReviewDto } from './dto/update-review.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post(':detectiveId')
  @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: '리뷰 작성', description: '리뷰 작성 입니다' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: CreateReviewDto })
  async create(
    @Param('detectiveId') detectiveId: number,
    @Body() dto: CreateReviewDto,
    @UserInfo('id') userId: number,
    @Res() res: Response,
  ) {
    const foundUser = await this.reviewService.findUserById(userId);
    if (!foundUser) {
      throw new BadRequestException('존재하지 않는 계정입니다.');
    }
    const detective = await this.reviewService.findDetectiveById(detectiveId);
    if (!detective) {
      throw new BadRequestException('존재하지 않는 탐정입니다.');
    }
    const review = await this.reviewService.create({ ...dto, detective, consumer: foundUser });
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: '리뷰를 생성하였습니다.',
      data: review,
    });
  }

  @Get(':detectiveId')
  @ApiOperation({ summary: '리뷰 조회', description: '리뷰 조회' })
  async findAll(
    @Param('detectiveId') detectiveId: number,
    @Query() query: FindReviewsQueryDto,
    @Res() res: Response,
  ) {
    try {
      const take = query.limit;
      const skip = (query.page - 1) * take;
      const reviews = await this.reviewService.findAll(detectiveId, skip, take);

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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiConsumes('application/x-www-urlencoded')
  @ApiOperation({ summary: '리뷰 수정', description: '리뷰 수정' })
  @ApiBody({ type: UpdateReviewDto })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateReviewDto,
    @UserInfo('id') userId: number,
    @Res() res: Response,
  ) {
    const review = await this.reviewService.findOne(id);
    if (!review) {
      throw new NotFoundException('존재하지 않는 리뷰입니다.');
    }
    if (review.consumer.id !== userId) {
      throw new UnauthorizedException('수정할 권한이 없습니다.');
    }
    const updated = await this.reviewService.update(id, dto);
    if (updated.affected !== 1) {
      throw new ConflictException('리뷰 수정을 완료할 수 없습니다.');
    }
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '리뷰를 성공적으로 수정 완료하였습니다.',
    });
  }
}
