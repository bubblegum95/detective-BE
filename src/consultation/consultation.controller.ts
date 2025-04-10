import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseFilters,
  Res,
  HttpStatus,
  Query,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { UserInfo } from '../utils/decorators/decorator';
import { User } from '../user/entities/user.entity';
import { Detective } from '../detective/entities/detective.entity';
import { HttpExceptionFilter } from '../utils/filter/http-exception.filter';
import { Response } from 'express';
import { ConsumerConsultationsQueryDto } from './dto/consumer-consultations-query.dto';
import { DetectiveConsultationsQueryDto } from './dto/detective-consultations-query.dto';
import { Consultation } from './entities/consultation.entity';
import { ConsultationStatus } from './types/status.type';
import { Category } from '../category/entities/category.entity';

@Controller('consultations')
@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionFilter)
@ApiTags('Consultations')
@ApiBearerAuth('authorization')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post(':detectiveId')
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: '상담 신청', description: '상담 신청' })
  @ApiBody({ type: CreateConsultationDto })
  @ApiParam({ name: 'detectiveId', type: 'number', example: 1, description: '탐정 id' })
  @ApiQuery({ name: 'categoryId', type: 'number', example: 1, description: '카테고리 id' })
  async create(
    @Param('detectiveId', ParseIntPipe) detectiveId: Detective['id'],
    @Query('categoryId', ParseIntPipe) categoryId: Category['id'],
    @Body() dto: CreateConsultationDto,
    @UserInfo('id') userId: User['id'],
    @Res() res: Response,
  ) {
    console.log(detectiveId, typeof detectiveId, categoryId, typeof categoryId);
    const consumer = await this.consultationService.findUser(+userId);
    const detective = await this.consultationService.findDetectiveWithUser(+detectiveId);
    const category = await this.consultationService.findCategory(categoryId);
    if (!consumer || !detective || !category) {
      throw new BadRequestException('사용자, 탐정, 또는 카테고리가 없습니다.');
    }
    if (detective.user.id === userId) {
      throw new BadRequestException('자기 자신에게 상담 요청을 할 수 없습니다.');
    }
    const consultation = await this.consultationService.create(dto, consumer, detective, category);
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: '상담 신청을 성공적으로 완료하였습니다.',
      data: consultation,
    });
  }

  @Get('consumer')
  @ApiOperation({ summary: '상담 신청 내역 조회', description: '상담 신청 내역 조회' })
  async findAllForConsumers(
    @UserInfo('id') userId: User['id'],
    @Query() query: ConsumerConsultationsQueryDto,
    @Res() res: Response,
  ) {
    const limit = query.limit;
    const offset = (query.page - 1) * limit;
    const [consultations, total] = await this.consultationService.findAllForConsumers(
      userId,
      offset,
      limit,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '내 상담 신청 내역을 조회합니다.',
      total,
      data: consultations,
    });
  }

  @Get('detective')
  @ApiOperation({ summary: '상담 의뢰 조회', description: '상담 의뢰 조회' })
  async findAllForDetectives(
    @UserInfo('id') userId: User['id'],
    @Query() query: DetectiveConsultationsQueryDto,
    @Res() res: Response,
  ) {
    const take = query.limit;
    const skip = (query.page - 1) * take;
    const [consultations, total] = await this.consultationService.findAllForDetectives(
      userId,
      skip,
      take,
      query.status,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '내 상담을 조회합니다.',
      total,
      data: consultations,
    });
  }

  @Get(':id')
  @ApiOperation({ description: '상담 내역 단일 조회', summary: '상담 내역 단일 조회' })
  @ApiParam({ name: 'id', example: 1, type: 'number', description: '상담 id' })
  async findOne(@Param('id') id: Consultation['id'], @UserInfo('id') userId: User['id']) {
    const consulting = await this.consultationService.findOne(+id);
    if (!consulting) {
      throw new BadRequestException('상담 내역을 찾을 수 없습니다.');
    }
    return {
      success: true,
      message: '상담 내역을 조회합니다.',
      data: consulting,
    };
  }

  @Patch(':id/content')
  @ApiOperation({ description: '상담 내용 수정', summary: '상담 내용 수정' })
  @ApiConsumes('applicaiton/x-www-form-urlencoded')
  @ApiBody({ type: UpdateConsultationDto })
  @ApiParam({ name: 'id', type: 'number', example: 1, description: '상담 id' })
  async updateContent(
    @Param('id') id: Consultation['id'],
    @Body() updateConsultationDto: UpdateConsultationDto,
    @UserInfo('id') userId: User['id'],
  ) {
    const consultant = await this.consultationService.findOneWithRelations(id);
    if (consultant.consumer.id !== userId) {
      throw new UnauthorizedException('상담 내역을 수정할 권한이 없습니다.');
    }
    const updated = await this.consultationService.updateContent(+id, updateConsultationDto);
    if (updated.affected !== 1) {
      throw new ConflictException('수정을 완료할 수 없습니다.');
    }
    return {
      success: true,
      message: '상담 신청 내용을 수정하였습니다.',
    };
  }

  @Patch(':id/status')
  @ApiOperation({ description: '상담 상태 수정', summary: '상담 상태 수정' })
  @ApiParam({ name: 'id', type: 'number', example: 1, description: '상담 id' })
  @ApiQuery({
    name: 'status',
    type: 'enum',
    enum: ConsultationStatus,
    example: ConsultationStatus.PENDING,
  })
  async updateStatus(
    @Param('id') id: Consultation['id'],
    @Query('status') status: ConsultationStatus,
    @UserInfo('id') userId: User['id'],
  ) {
    const consultant = await this.consultationService.findOneWithRelations(id);
    const detective = consultant.detective.user;
    if (detective.id !== userId) {
      throw new UnauthorizedException('상담 상태를 수정할 권한이 없습니다.');
    }
    const updated = await this.consultationService.updateStatus(+id, status);
    if (updated.affected !== 1) {
      throw new ConflictException('수정을 완료할 수 없습니다.');
    }
    return {
      success: true,
      message: '상담 신청 내용을 수정하였습니다.',
    };
  }

  @Delete(':id')
  @ApiOperation({ description: '상담 삭제', summary: '상담 삭제' })
  @ApiParam({ name: 'id', type: 'number', example: 1, description: '상담 id' })
  async remove(@Param('id') id: Consultation['id'], @UserInfo('id') userId: User['id']) {
    const consulting = await this.consultationService.findOne(id);
    if (!consulting) {
      throw new BadRequestException('상담 내역이 없습니다.');
    }
    if (consulting.consumer.id !== userId) {
      throw new BadRequestException('권한이 없습니다.');
    }
    return await this.consultationService.remove(+id);
  }
}
