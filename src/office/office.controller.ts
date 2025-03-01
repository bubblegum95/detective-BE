import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OfficeService } from './office.service';
import { Response } from 'express';
import { OfficeQueryDto } from './dto/office-query.dto';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { UserInfo } from '../utils/decorators/decorator';
import { User } from '../user/entities/user.entity';
import { Office } from './entities/office.entity';
import { ApplicationService } from './application.service';
import { Application } from './entities/application.entity';
import { ApplicationQueryDto } from './dto/application-query.dto';

@ApiTags('offices')
@Controller('offices')
export class OfficeController {
  constructor(
    private readonly officeService: OfficeService,
    private readonly applicationService: ApplicationService,
  ) {}

  @Get()
  @ApiOperation({ description: '오피스 키워드 검색', summary: '오피스 키워드 검색' })
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

  @Get(':id/applications')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    description: '오피스 직원등록 신청서 조회',
    summary: '오피스 직원등록 신청서 조회',
  })
  @ApiBearerAuth('authorization')
  async findApplications(
    @Param('id') id: Office['id'],
    @Query() query: ApplicationQueryDto,
    @UserInfo('id') userId: User['id'],
    @Res() res: Response,
  ) {
    try {
      const office = await this.officeService.findOneById(id);
      if (office.owner.id !== userId) {
        throw new UnauthorizedException('권한이 없습니다.');
      }
      const take = query.limit;
      const skip = (query.page - 1) * take;
      const applications = await this.applicationService.findMany(id, skip, take);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '신청서를 가져옵니다.',
        data: applications,
      });
    } catch (error) {
      return res.status(error.status).json({
        success: false,
        message: '신청서 목록을 가져올 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Patch('applications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: '오피스 직원 등록 승인', description: '오피스 직원 등록 승인' })
  async processApplication(
    @UserInfo('id') userId: User['id'],
    @Param('id') id: Application['id'],
    @Query('type') type: 'approval' | 'deny',
    @Res() res: Response,
  ) {
    try {
      const application = await this.applicationService.findOne(id);
      const owner = application.office.owner;
      if (userId !== owner.id) {
        throw new UnauthorizedException('사업자 본인이 아닙니다.');
      }
      switch (type) {
        case 'approval':
          await this.applicationService.update(id, { clear: true, result: true });
          await this.officeService.approve(application.requester, application.office);
          break;

        case 'deny':
          await this.applicationService.update(id, { clear: true, result: false });
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '직원 등록을 성공적으로 완료하였습니다.',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: '직원 등록을 수행할 수 없습니다.',
        error: error.message,
      });
    }
  }
}
