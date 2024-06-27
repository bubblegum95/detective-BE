import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { DetectiveofficeService } from './detectiveoffice.service';
import { CreateDetectiveOfficeDto } from './dto/create-office.dto';
import { DetectiveOffice } from './entities/detective-office.entity';
import { RelationshipDto } from './dto/create-relationship.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiOperation } from '@nestjs/swagger';

@Controller('detectiveoffice')
export class DetectiveofficeController {
  constructor(private readonly detectiveOfficeService: DetectiveofficeService) {}

  // @Post()
  // create(@Body() createDetectiveOfficeDto: CreateDetectiveOfficeDto): Promise<DetectiveOffice> {
  //   return this.detectiveOfficeService.createDetectiveOffice(createDetectiveOfficeDto);
  // }

  // 오피스 등록 요청
  @UseGuards(JwtAuthGuard)
  @Post('request')
  @ApiOperation({ summary: '오피스 등록 요청', description: '오피스 등록 요청' })
  async requestRegistration(@Body() relationshipDto: RelationshipDto) {
    return this.detectiveOfficeService.requestRegistration(relationshipDto);
  }

  // 오피스 등록 수락
  @Post('approve/:id')
  @ApiOperation({ summary: '오피스 등록 수락', description: '오피스 등록 수락' })
  async approveRegistration(@Param('id') id: number) {
    return this.detectiveOfficeService.approveRegistration(id);
  }
}
