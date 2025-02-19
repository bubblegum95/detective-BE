import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { UserInfo } from '../utils/decorators/decorator';
import { User } from '../user/entities/user.entity';

@Controller('consultations')
@ApiTags('Consultations')
export class ConsultationController {
  constructor(private readonly consultationService: ConsultationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiOperation({ summary: '상담 신청', description: '상담 신청' })
  @ApiBody({ type: CreateConsultationDto })
  create(@Body() dto: CreateConsultationDto, @UserInfo() user: User) {
    return this.consultationService.create(dto);
  }

  @Get()
  findAll() {
    return this.consultationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consultationService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
    @UserInfo() user: User,
  ) {
    return this.consultationService.update(+id, updateConsultationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @UserInfo() user: User) {
    return this.consultationService.remove(+id);
  }
}
