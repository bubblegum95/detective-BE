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
} from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  async create(
    @Param('detectiveId') detectiveId: Detective['id'],
    @Body() dto: CreateConsultationDto,
    @UserInfo('id') userId: User['id'],
    @Res() res: Response,
  ) {
    const consumer = await this.consultationService.findUser(userId);
    const detective = await this.consultationService.findDetective(detectiveId);
    const consultation = await this.consultationService.create(dto, consumer, detective);
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
    const take = query.limit;
    const skip = (query.page - 1) * take;
    const consultations = await this.consultationService.findAllForConsumers(userId, skip, take);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '내 상담 신청 내역을 조회합니다.',
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
    const consultations = await this.consultationService.findAllForDetectives(
      userId,
      skip,
      take,
      query.status,
    );
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '내 상담을 조회합니다.',
      data: consultations,
    });
  }

  @Get(':id')
  @ApiOperation({ description: '상담 내역 단일 조회', summary: '상담 내역 단일 조회' })
  async findOne(@Param('id') id: Consultation['id']) {
    const consultation = this.consultationService.findOne(+id);
    return {
      success: true,
      message: '상담 내역을 조회합니다.',
      data: consultation,
    };
  }

  @Patch(':id/content')
  @ApiOperation({ description: '상담 내용 수정', summary: '상담 내용 수정' })
  @ApiConsumes('applicaiton/x-www-form-urlencoded')
  @ApiBody({ type: UpdateConsultationDto })
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
  remove(@Param('id') id: string, @UserInfo() user: User) {
    return this.consultationService.remove(+id);
  }
}
