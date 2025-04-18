import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
  UseFilters,
  ConflictException,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { UserInfo } from '../utils/decorators/decorator';
import { Role } from '../role/entities/role.entity';
import { Equipment } from './entities/equipment.entity';
import { HttpExceptionFilter } from '../utils/filter/http-exception.filter';
import { Response } from 'express';

@Controller('equipments')
@UseFilters(HttpExceptionFilter)
@ApiTags('Equipments')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiBody({ type: CreateEquipmentDto })
  async create(
    @Body() dto: CreateEquipmentDto,
    @UserInfo('role') role: Role,
    @Res() res: Response,
  ) {
    if (role.name !== 'admin') {
      throw new UnauthorizedException('권한이 없습니다.');
    }
    const equipment = await this.equipmentService.create(dto);
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: '장비 생성을 완료하였습니다.',
      data: equipment,
    });
  }

  @Get()
  async findAll(@Res() res: Response) {
    const equipments = await this.equipmentService.findAll();
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '장비 조회',
      data: equipments,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: Equipment['id']) {
    return await this.equipmentService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiBody({ type: UpdateEquipmentDto })
  async update(
    @Param('id') id: Equipment['id'],
    @Body() dto: UpdateEquipmentDto,
    @UserInfo('role') role: Role,
    @Res() res: Response,
  ) {
    if (role.name !== 'admin') {
      throw new UnauthorizedException('권한이 없습니다.');
    }
    const result = await this.equipmentService.update(+id, dto);
    if (result.affected !== 1) {
      throw new ConflictException('수정을 완료할 수 없습니다.');
    }
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '수정을 완료하였습니다.',
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  async remove(@Param('id') id: Equipment['id'], @UserInfo('role') role: Role) {
    return await this.equipmentService.remove(+id);
  }
}
