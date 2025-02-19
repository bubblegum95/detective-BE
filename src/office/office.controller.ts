import { Controller, Get, HttpStatus, Post, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserInfo } from 'src/utils/decorators/decorator';
import { User } from 'src/user/entities/user.entity';
import { OfficeService } from './office.service';
import { Response } from 'express';
import { OfficeQueryDto } from './dto/office-query.dto';

@ApiTags('offices')
@Controller('offices')
export class OfficeController {
  constructor(private readonly officeService: OfficeService) {}

  @Get()
  async findOfficeByKeyword(@Query() query: OfficeQueryDto, @Res() res: Response) {
    try {
      const { name, page, limit } = query;
      const skip = (page - 1) * limit;
      const offices = await this.officeService.findByName(name, limit, skip);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '오피스를 조회합니다.',
        data: offices,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: '오피스 조회를 요청할 수 없습니다.',
        error: error.message,
      });
    }
  }

  // 오피스 등록 요청
  @Post('request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: '오피스 등록 요청', description: '오피스 등록 요청' })
  async requestRegistration(
    @Query('officeId') officeId: number,
    @UserInfo() user: User,
    @Res() res: Response,
  ) {
    try {
      const req = this.officeService.requestRegistration(officeId, user);
      res.status(HttpStatus.OK).json({
        success: true,
        message: '해당 사무소로 탐정 직원 등록 요청을 성공적으로 완료하였습니다.',
      });
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: '해당 사무로소 탐정 직원 등록 요청을 할 수 없습니다.',
        error: error.message,
      });
    }
  }
}
