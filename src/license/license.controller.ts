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
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { LicenseService } from './license.service';
import { UpdateLicenseDto } from './dto/update-license.dto';
import { CreateLicenseDto } from './dto/create-license.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserInfo } from '../utils/decorators/decorator';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { HttpExceptionFilter } from '../utils/filter/http-exception.filter';
import { Response } from 'express';
import { License } from './entities/license.entity';

@Controller('licenses')
@UseGuards(JwtAuthGuard)
@UseFilters(HttpExceptionFilter)
@ApiTags('Licenses')
@ApiBearerAuth('authorization')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  @Post()
  @ApiOperation({ description: '자격증 정보 생성', summary: '자격증 정보 생성' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: CreateLicenseDto })
  async create(
    @Body() createLicenseDto: CreateLicenseDto,
    @UserInfo('id') userId: User['id'],
    @Res() res: Response,
  ) {
    const user = await this.licenseService.findUser(userId);
    const detective = user.detective;
    const license = await this.licenseService.create(createLicenseDto, detective);
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: '자격증 생성을 완료하였습니다.',
      data: license,
    });
  }

  @Get()
  async findAll(@UserInfo('id') userId: User['id'], @Res() res: Response) {
    const licenses = await this.licenseService.findAll(userId);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '자격증 정보를 조회합니다.',
      data: licenses,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: License['id'], @Res() res: Response) {
    const license = await this.licenseService.findOne(+id);
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '자격증 정보를 조회합니다.',
      data: license,
    });
  }

  @Patch(':id')
  @ApiOperation({ description: '자격증 정보 수정', summary: '자격증 정보 수정' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: UpdateLicenseDto })
  async update(
    @Param('id') id: License['id'],
    @UserInfo('id') userId: User['id'],
    @Body() dto: UpdateLicenseDto,
    @Res() res: Response,
  ) {
    const user = await this.licenseService.findUser(userId);
    const license = await this.licenseService.findOneWithDetective(id);
    if (user.detective.id !== license.detective.id) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
    const result = await this.licenseService.update(+id, dto);
    if (result.affected !== 1) {
      throw new ConflictException('수정을 완료할 수 없습니다.');
    }
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '자격증 정보 수정을 완료하였습니다.',
    });
  }

  @Delete(':id')
  @ApiOperation({ description: '자격증 정보 삭제', summary: '자격증 정보 삭제' })
  async remove(
    @Param('id') id: License['id'],
    @UserInfo('id') userId: User['id'],
    @Res() res: Response,
  ) {
    const user = await this.licenseService.findUser(userId);
    const license = await this.licenseService.findOneWithDetective(id);
    if (user.detective.id !== license.detective.id) {
      throw new UnauthorizedException('권한이 없습니다.');
    }
    const result = await this.licenseService.remove(id);
    if (result.affected !== 1) {
      throw new ConflictException('수정을 완료할 수 없습니다.');
    }
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '자격증 정보 삭제를 완료하였습니다.',
    });
  }
}
