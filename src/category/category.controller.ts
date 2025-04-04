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
  Res,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../utils/guards/jwt-auth.guard';
import { UserInfo } from '../utils/decorators/decorator';
import { Role } from '../role/entities/role.entity';
import { Response } from 'express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../utils/filter/http-exception.filter';

@Controller('category')
@UseFilters(HttpExceptionFilter)
@ApiTags('Categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ description: '카테고리/분야 생성', summary: '카테고리/분야 생성' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: CreateCategoryDto })
  async create(@Body() dto: CreateCategoryDto, @UserInfo('role') role: Role, @Res() res: Response) {
    if (role.name !== 'admin') {
      throw new UnauthorizedException('카테고리 생성 권한이 없습니다.');
    }
    const category = await this.categoryService.create(dto);
    return res.status(HttpStatus.CREATED).json({
      success: true,
      message: '카테고리를 성공적으로 생성 완료하였습니다.',
      data: category,
    });
  }

  @Get()
  @ApiOperation({ description: '카테고리/분야 조회', summary: '카테고리/분야 조회' })
  async findAll(@Res() res: Response) {
    const categories = await this.categoryService.findAll();
    return res.status(HttpStatus.OK).json({
      success: true,
      message: '카테고리 목록을 조회합니다.',
      data: categories,
    });
  }

  @Get(':id')
  @ApiOperation({ description: '카테고리/분야 조회', summary: '카테고리/분야 조회' })
  async findOne(@Param('id') id: string) {
    return await this.categoryService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ description: '카테고리/분야 수정', summary: '카테고리/분야 수정' })
  @ApiConsumes('application/x-www-form-urlencoded')
  @ApiBody({ type: UpdateCategoryDto })
  async update(
    @Param('id') id: string,
    @UserInfo('role') role: Role,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    if (role.name !== 'admin') {
      throw new UnauthorizedException('카테고리 수정 권한이 없습니다.');
    }
    return await this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ description: '카테고리/분야 생성', summary: '카테고리/분야 생성' })
  async remove(@Param('id') id: string, @UserInfo('role') role: Role) {
    if (role.name !== 'admin') {
      throw new UnauthorizedException('카테고리 삭제 권한이 없습니다.');
    }
    return await this.categoryService.remove(+id);
  }
}
