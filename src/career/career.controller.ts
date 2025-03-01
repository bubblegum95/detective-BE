import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UnauthorizedException,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { CareerService } from './career.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCareerDto } from './dto/create-career.dto';
import { UserInfo } from '../utils/decorators/decorator';
import { User } from '../user/entities/user.entity';
import { Response } from 'express';
import { HttpExceptionFilter } from '../utils/filter/http-exception.filter';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { UpdateCareerDto } from './dto/update-career.dto';

@Controller('careers')
@UseGuards(JwtAuthGuard)
@ApiTags('Careers')
@ApiBearerAuth('authorization')
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @Post()
  @ApiOperation({ summary: '커리어 생성', description: '커리어 생성' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: CreateCareerDto })
  async create(
    @Body() dto: CreateCareerDto,
    @UserInfo('id') userId: User['id'],
    @Res() res: Response,
  ) {
    try {
      const user = await this.careerService.findUser(userId);
      const career = await this.careerService.create(user, dto);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: '커리어를 성공적으로 생성완료하였습니다.',
        data: career,
      });
    } catch (error) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: '커리어를 생성할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Get()
  @UseFilters(HttpExceptionFilter)
  async findMany(@UserInfo('id') userId: User['id']) {
    const careers = await this.findMany(userId);
    return {
      success: true,
      message: '커리어를 조회합니다.',
      data: careers,
    };
  }

  @Patch(':id')
  @UseFilters(HttpExceptionFilter)
  @ApiBody({ type: UpdateCareerDto })
  @ApiOperation({ summary: '커리어 수정', description: '커리어 수정' })
  @ApiConsumes('application/x-www-form-urlencoded')
  async update(
    @Body() dto: UpdateCareerDto,
    @UserInfo('id') userId: User['id'],
    @Param('id') id: number,
  ) {
    const career = await this.careerService.findOne(id);
    const owner = career.detective.user;
    if (userId !== owner.id) {
      throw new UnauthorizedException('수정 권한이 없습니다.');
    }
    const updated = await this.careerService.update(id, { ...dto });
    if (updated.affected !== 1) {
      throw new ConflictException('커리어 수정을 완료할 수 없습니다.');
    }
    return {
      success: true,
      message: '커리어를 성공적으로 수정하였습니다.',
    };
  }

  @Delete(':id')
  @UseFilters(HttpExceptionFilter)
  @ApiOperation({ summary: '커리어 삭제', description: '커리어 삭제' })
  async remove(@UserInfo('id') userId: User['id'], @Param('id') id: number) {
    const career = await this.careerService.findOne(id);
    if (career.detective.user.id !== userId) {
      throw new UnauthorizedException('수정 권한이 없습니다.');
    }
    const result = await this.careerService.remove(id);
    if (result.affected !== 1) {
      throw new ConflictException('커리어 삭제를 완료할 수 없습니다.');
    }
    return {
      success: true,
      message: '커리어를 삭제하였습니다.',
    };
  }
}
