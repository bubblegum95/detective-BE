import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  HttpStatus,
  UnauthorizedException,
  UseFilters,
} from '@nestjs/common';
import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { Response } from 'express';
import { UserInfo } from '../utils/decorators/decorator';
import { User } from '../user/entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { HttpExceptionFilter } from '../utils/filter/http-exception.filter';

@Controller('regions')
@UseFilters(HttpExceptionFilter)
@ApiTags('Regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiBody({ type: CreateRegionDto })
  @ApiOperation({ description: '활동지역 생성', summary: '활동지역 생성' })
  @ApiConsumes('application/x-www-form-urlencoded')
  async create(
    @Body() createRegionDto: CreateRegionDto,
    @Res() res: Response,
    @UserInfo() user: User,
  ) {
    try {
      if (user.role.name !== 'admin') {
        throw new UnauthorizedException('권한이 없습니다.');
      }
      const region = await this.regionService.create(createRegionDto);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: '활동지역을 성공적으로 생성완료하였습니다.',
        data: region,
      });
    } catch (error) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: '활동지역 생성을 완료할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Get()
  @ApiOperation({ description: '활동지역 조회', summary: '활동지역 조회' })
  async findAll(@Res() res: Response) {
    try {
      const regions = await this.regionService.findAll();
      return res
        .status(HttpStatus.OK)
        .json({ success: true, message: '활동지역을 조회합니다.', data: regions });
    } catch (error) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: '활동지역을 조회할 수 없습니다.',
        error: error.message,
      });
    }
  }

  @Get(':id')
  @ApiOperation({ description: '활동지역 조회', summary: '활동지역 조회' })
  async findOne(@Param('id') id: string) {
    return await this.regionService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ description: '활동지역 수정', summary: '활동지역 수정' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  async update(
    @Param('id') id: string,
    @UserInfo('role') role: Role,
    @Body() dto: UpdateRegionDto,
  ) {
    if (role.name !== 'admin') {
      throw new UnauthorizedException('수정 권한이 없습니다.');
    }
    return await this.regionService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: '활동지역 수정', summary: '활동지역 수정' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBearerAuth('authorization')
  async remove(@Param('id') id: string, @UserInfo('role') role: Role) {
    if (role.name !== 'admin') {
      throw new UnauthorizedException('삭제 권한이 없습니다.');
    }
    return await this.regionService.remove(+id);
  }
}
