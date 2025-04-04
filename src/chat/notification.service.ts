import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Notice } from './entities/notice.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
  ) {}

  async findManyNotRead(receiverId: User['id']) {
    return await this.noticeRepository
      .createQueryBuilder('notice')
      .leftJoin('notice.receiver', 'receiver')
      .leftJoinAndSelect('notice.message', 'message')
      .leftJoin('message.sender', 'sender')
      .leftJoinAndSelect('sender.user', 'user')
      .leftJoinAndSelect('message.room', 'room')
      .where('receiver.id = :receiverId', { receiverId })
      .select('user.nickname', 'room.id')
      .getMany();
  }

  async findOne(id: Notice['id']) {
    return await this.noticeRepository
      .createQueryBuilder('notice')
      .leftJoinAndSelect('notice.message', 'message')
      .leftJoinAndSelect('message.room', 'room')
      .leftJoin('message.sender', 'sender')
      .leftJoinAndSelect('sender.user', 'user')
      .where('notice.id = :id', { id })
      .addSelect(['room.id', 'user.nickname'])
      .getOne();
  }

  async create(dto: CreateNotificationDto) {
    return await this.noticeRepository.save({ ...dto });
  }

  async update(id: Notice['id']) {
    return await this.noticeRepository.update(id, { read: true });
  }
}
