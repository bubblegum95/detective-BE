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

  create(dto: CreateCategoryDto) {
    return this.categoryRepository.save({ ...dto });
  }

  findAll() {
    return this.categoryRepository.find();
  }

  findOne(id: number) {
    return this.categoryRepository.findOne({ where: { id } });
  }

  update(id: number, dto: UpdateCategoryDto) {
    return this.categoryRepository.update({ id }, { ...dto });
  }

  remove(id: number) {
    return this.categoryRepository.delete({ id });
  }
}
