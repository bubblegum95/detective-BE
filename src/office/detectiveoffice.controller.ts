import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { DetectiveofficeService } from './detectiveoffice.service';
import { CreateDetectiveOfficeDto } from './dto/create-office.dto';
import { DetectiveOffice } from './entities/detective-office.entity';
import { RelationshipDto } from './dto/create-relationship.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiOperation } from '@nestjs/swagger';
import { UserInfo } from 'src/utils/decorator';
import { User } from 'src/user/entities/user.entity';

@Controller('offices')
export class DetectiveofficeController {
  constructor(private readonly officeService: DetectiveofficeService) {}

  // @Post()
  // create(@Body() createDetectiveOfficeDto: CreateDetectiveOfficeDto): Promise<DetectiveOffice> {
  //   return this.officeService.createDetectiveOffice(createDetectiveOfficeDto);
  // }
  @Post('')
  async findOfficeByKeyword(@Query('key') key: string) {
    return await this.officeService.findOfficeByKeyword(key);
  }
  // 오피스 등록 요청
  @UseGuards(JwtAuthGuard)
  @Post('request')
  @ApiOperation({ summary: '오피스 등록 요청', description: '오피스 등록 요청' })
  async requestRegistration(@Body() body: { key: string }, @UserInfo() user: User) {
    return this.officeService.requestRegistration(body.key, user.id);
  }

  // 오피스 등록 수락
  @UseGuards(JwtAuthGuard)
  @Post('approve/:officeId')
  @ApiOperation({ summary: '오피스 등록 수락', description: '오피스 등록 수락' })
  async approveRegistration(
    @Param('officeId') officeId: number,
    @Body('email') email: string,
    @UserInfo() user: User,
  ) {
    return this.officeService.approveRegistration(officeId, email, user.id);
  }
}
