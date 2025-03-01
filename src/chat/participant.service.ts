import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Participant } from './entities/participant.entity';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(Participant) private readonly participantRepository: Repository<Participant>,
  ) {}

  async create(room: Room, user: User): Promise<Participant> {
    return await this.participantRepository.save({
      room,
      user,
    });
  }

  async findByRoomUser(roomId: Room['id'], userId: User['id']): Promise<Participant> {
    return await this.participantRepository.findOne({
      where: { room: { id: roomId }, user: { id: userId } },
      relations: ['room'],
    });
  }

  async findWithUser(id: Participant['id']) {
    return await this.participantRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findRoom(userId: User['id'], recipientId: User['id']) {
    return await this.participantRepository
      .createQueryBuilder('p1')
      .innerJoin('participant', 'p2', 'p1.roomId = p2.roomId')
      .where('p1.userId = :userId', { userId })
      .andWhere('p2.userId = :recipientId', { recipientId })
      .select('p1.roomId')
      .getOne();
  }
}
