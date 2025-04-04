import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    return await this.categoryRepository.save({ ...dto });
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findOne(id: number) {
    return await this.categoryRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateCategoryDto) {
    return await this.categoryRepository.update({ id }, { ...dto });
  }

  async remove(id: number) {
    return await this.categoryRepository.delete({ id });
  }
}
