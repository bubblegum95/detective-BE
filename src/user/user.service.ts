import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { S3Service } from '../s3/s3.service';
import { File } from '../s3/entities/s3.entity';

@Injectable()
export class UserService {
  logger: Logger;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
  ) {}

  async create(dto: { email: string; password: string; nickname: string; phoneNumber: string }) {
    return await this.userRepository.save({ ...dto });
  }

  async findOneById(id: number) {
    return await this.userRepository.findOne({ where: { id }, relations: ['role', 'file'] });
  }

  async findOneByEmail(email: User['email']) {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.detective', 'detective')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findOneByEmailSeletPw(email: User['email']) {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
      relations: ['role'],
    });
  }

  async findOneByDigit(phoneNumber: User['phoneNumber']) {
    return await this.userRepository.findOne({ where: { phoneNumber } });
  }

  async findOneWithDetective(id: User['id']) {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['detective'],
    });
  }

  async findOneByIdSelectPw(id: number) {
    return await this.userRepository.findOne({ where: { id }, select: ['id', 'password'] });
  }

  async findOneByIdSelectNickname(id: number) {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.id = :id', { id })
      .select(['user.id', 'user.nickname', 'role.id', 'role.name'])
      .getOne();
  }

  async verifyPassword(inputPw: string, comparedPw: string) {
    return bcrypt.compareSync(inputPw, comparedPw);
  }

  async saveFile(path: string) {
    return await this.s3Service.savePath(path);
  }

  async updateFile(id: File['id'], dto: { path: File['path'] }) {
    return await this.s3Service.updateFile(id, dto);
  }

  async updateUserPhoto(userId: number, path: string) {
    try {
      const user = await this.findOneById(userId);

      if (!user.file) {
        const savedFile = await this.saveFile(path);
        user.file = savedFile;
        await this.userRepository.save(user);
        return 1;
      } else {
        const file = user.file;
        file.path = path;
        const updated = await this.updateFile(file.id, { path });
        return updated.affected;
      }
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, dto: { nickname?: string; password?: string; profile?: number }) {
    try {
      const result = await this.userRepository.update(
        { id },
        {
          ...dto,
        },
      );
      return result.affected;
    } catch (error) {
      throw error;
    }
  }

  createNewDate(date: Date) {
    return date.toString().split(' ', 4).reverse().join(' ');
  }
}
