import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Query,
  UseFilters,
  Res,
  HttpStatus,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { Detective } from '../detective/entities/detective.entity';
import { UserInfo } from '../utils/decorators/decorator';
import { User } from '../user/entities/user.entity';
import { HttpExceptionFilter } from '../utils/filter/http-exception.filter';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { WishList } from './entities/wish-list.entity';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionFilter)
@ApiBearerAuth('authorization')
@ApiTags('WishList')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  @ApiOperation({ summary: '위시리스트 생성', description: '위시리스트 조회' })
  async create(
    @Query('detectiveId') detectiveId: Detective['id'],
    @UserInfo('id') userId: User['id'],
    @Res() res: Response,
  ) {
    const detective = await this.wishlistService.findDetective(detectiveId);
    const consumer = await this.wishlistService.findConsumer(userId);
    if (!detective || !consumer) {
      throw new BadRequestException('사용자 또는 탐정이 존재하지 않습니다.');
    }
    const wishList = await this.wishlistService.create({ consumer, detective });
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: '위시리스트를 성공적으로 생성완료하였습니다.',
      data: wishList,
    });
  }

  @Get()
  @ApiOperation({ summary: '위시 리스트 조회', description: '위시 리스트 조회' })
  async findAll(@UserInfo('id') userId: User['id'], @Res() res: Response) {
    const wishList = this.wishlistService.findAll(userId);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '위시리스트 조회',
      data: wishList,
    });
  }

  @Delete(':id')
  async remove(
    @Param('id') id: WishList['id'],
    @UserInfo('id') userId: User['id'],
    @Res() res: Response,
  ) {
    const wishlist = await this.wishlistService.findOne(id);
    if (userId !== wishlist.consumer.id) {
      throw new BadRequestException('권한이 없습니다.');
    }
    const deleted = await this.wishlistService.remove(+id);
    if (deleted.affected !== 1) {
      throw new ConflictException('위시리스트 삭제를 완료할 수 없습니다.');
    }
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '위시리스트를 삭제하였습니다.',
    });
  }
}
