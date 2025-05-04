import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
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
import { UpdateOfficeDto } from './dto/update-office.dto';

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

  @Get('my-office')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: '내 오피스 조회', summary: '내 오피스 조회' })
  @ApiBearerAuth('authorization')
  async findMyOffice(@UserInfo('id') userId: User['id'], @Res() res: Response) {
    try {
      const office = await this.officeService.findOneByUserIdWithDetective(userId);
      if (!office) {
        throw new BadRequestException('사업자 계정이 아닙니다.');
      }
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '내 사무소 정보를 조회합니다.',
        data: office,
      });
    } catch (error) {
      return res.status(error.status).json({
        success: false,
        message: '내 사무소 정보를 조회할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Patch('my-office')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: '내 오피스 수정', summary: '내 오피스 수정' })
  @ApiBearerAuth('authorization')
  async updateMyOffice(
    @UserInfo('id') userId: User['id'],
    @Res() res: Response,
    @Body() dto: UpdateOfficeDto,
  ) {
    try {
      const office = await this.officeService.findOneByUserId(userId);
      if (!office) {
        throw new BadRequestException('해당 탐정사무소를 조회할 수 없습니다.');
      }
      const result = await this.officeService.update(office.id, dto);
      if (result.affected !== 1) {
        throw new BadRequestException('탐정사무소 정보 업데이트를 완료할 수 없습니다.');
      }

      return res.status(HttpStatus.OK).json({
        success: true,
        message: '내 탐정사무소 정보 업데이트를 완료하였습니다.',
      });
    } catch (error) {
      return res.status(error.status).json({
        success: false,
        message: '내 탐정사무소 정보를 업데이트 할 수 없습니다.',
        error: error.message,
      });
    }
  }

  // @Get(':id/applications')
  // @UseGuards(JwtAuthGuard)
  // @ApiOperation({
  //   description: '오피스 직원등록 신청서 조회',
  //   summary: '오피스 직원등록 신청서 조회',
  // })
  // @ApiBearerAuth('authorization')
  // async findApplications(
  //   @Param('id') id: Office['id'],
  //   @Query() query: ApplicationQueryDto,
  //   @UserInfo('id') userId: User['id'],
  //   @Res() res: Response,
  // ) {
  //   try {
  //     const office = await this.officeService.findOneById(id);
  //     if (office.owner.id !== userId) {
  //       throw new UnauthorizedException('권한이 없습니다.');
  //     }
  //     const take = query.limit;
  //     const skip = (query.page - 1) * take;
  //     const applications = await this.applicationService.findMany(id, skip, take);

  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: '신청서를 가져옵니다.',
  //       data: applications,
  //     });
  //   } catch (error) {
  //     return res.status(error.status).json({
  //       success: false,
  //       message: '신청서 목록을 가져올 수 없습니다.',
  //       error: error.message,
  //     });
  //   }
  // }

  // @Post('applications/:id')
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('authorization')
  // @ApiOperation({ summary: '오피스 직원 등록 승인', description: '오피스 직원 등록 승인' })
  // async processApplication(
  //   @UserInfo('id') userId: User['id'],
  //   @Param('id') id: Application['id'],
  //   @Query('type') type: 'approval' | 'deny',
  //   @Res() res: Response,
  // ) {
  //   try {
  //     const application = await this.applicationService.findOne(id);
  //     const owner = application.office.owner;
  //     if (userId !== owner.id) {
  //       throw new UnauthorizedException('사업자 본인이 아닙니다.');
  //     }
  //     switch (type) {
  //       case 'approval':
  //         await this.applicationService.update(id, { clear: true, result: true });
  //         await this.officeService.approve(application.requester, application.office);
  //         break;

  //       case 'deny':
  //         await this.applicationService.update(id, { clear: true, result: false });
  //     }

  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: '직원 등록을 성공적으로 완료하였습니다.',
  //     });
  //   } catch (error) {
  //     return res.status(HttpStatus.BAD_REQUEST).json({
  //       success: false,
  //       message: '직원 등록을 수행할 수 없습니다.',
  //       error: error.message,
  //     });
  //   }
  // }

  @Post('employee')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: '오피스 직원 등록 승인', description: '오피스 직원 등록 승인' })
  async addEeployee(
    @UserInfo('id') userId: User['id'],
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    try {
      const { email, officeId } = await this.officeService.decodeInviteToken(token);
      const office = await this.officeService.findOneById(+officeId);
      if (userId !== office.owner.id) {
        throw new UnauthorizedException('권한이 없습니다.');
      }
      const requester = await this.officeService.findUserByEmail(email);
      const detective = requester.detective;
      if (!detective) {
        throw new BadRequestException('해당 직원을 찾을 수 없거나 이미 직원등록이 완료되었습니다.');
      }
      const save = await this.officeService.approve(detective, office);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: '직원등록을 완료하였습니다.',
      });
    } catch (error) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: '직원등록을 완료할 수 없습니다.',
        error: error.message,
      });
    }
  }
}
