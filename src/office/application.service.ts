import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Application } from './entities/application.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Office } from './entities/office.entity';
import { Detective } from '../detective/entities/detective.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  create(requester: Detective, office: Office) {
    return this.applicationRepository.create({ requester, office });
  }

  async findOne(id: Application['id']) {
    return this.applicationRepository.findOne({
      where: { id },
      relations: ['office', 'office.owner', 'requester'],
    });
  }

  async findMany(officeId: Office['id'], skip: number, take: number) {
    return await this.applicationRepository
      .createQueryBuilder('application')
      .leftJoin('application.office', 'office')
      .where('office.id = :officeId', { officeId })
      .andWhere('application.clear = :clear', { clear: false })
      .skip(skip)
      .take(take)
      .getMany();
  }

  async update(id: Application['id'], dto: { clear: boolean; result: boolean }) {
    return this.applicationRepository.update({ id }, { ...dto });
  }
}
