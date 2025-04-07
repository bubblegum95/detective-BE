import { Injectable } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { Room } from './entities/room.entity';
import { CreateMessageDto } from './dto/message-body.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { Participant } from './entities/participant.entity';

@Injectable()
export class MessageService {
  constructor(@InjectRepository(Message) private readonly messageRepository: Repository<Message>) {}

  async findMany(roomId: Room['id'], page: number, limit: number) {
    const offset = (page - 1) * limit;
    return await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('sender.user', 'user') // participant
      .leftJoin('message.room', 'room')
      .where('room.id = :roomId', { roomId })
      .addSelect(['sender.id', 'user.nickname'])
      .orderBy('timestamp', 'DESC')
      .offset(offset)
      .limit(limit)
      .getMany();
  }

  async findOneById(id: Message['id']) {
    return await this.messageRepository.findOne({ where: { id } });
  }

  async findOneByIdWithRoom(id: Message['id']) {
    return await this.messageRepository.findOne({ where: { id }, relations: ['room'] });
  }

  async findLastOne(roomId: Room['id']): Promise<Message | null> {
    const message = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoin('message.room', 'room')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('sender.user', 'user')
      .where('room.id = :roomId', { roomId })
      .addSelect(['sender.id', 'user.nickname'])
      .orderBy('timestamp', 'DESC')
      .getOne();

    if (!message) return null;
    return message;
  }

  async create(dto: CreateMessageDto) {
    return await this.messageRepository.save({ ...dto });
  }

  async update(id: Message['id'], readerId: Participant['id']) {
    return await this.messageRepository.update(
      { id },
      { notRead: () => `array_remove("not_read", ${+readerId})` },
    );
  }
}
