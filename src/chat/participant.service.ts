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

  async delete(id: Participant['id']) {
    return await this.participantRepository.delete({ id });
  }

  async findOneById(id: Participant['id']) {
    return await this.participantRepository.findOne({ where: { id } });
  }

  async findOneByIdWithUser(id: Participant['id']) {
    return await this.participantRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async findOneByUserId(userId: User['id']) {
    return await this.participantRepository
      .createQueryBuilder('participant')
      .leftJoin('participant.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();
  }

  async findOneByUserRoom(userId: User['id'], roomId: Room['id']) {
    return await this.participantRepository.findOne({
      where: { user: { id: userId }, room: { id: roomId } },
    });
  }

  async findByRoomUser(roomId: Room['id'], userId: User['id']): Promise<Participant> {
    return await this.participantRepository
      .createQueryBuilder('participant')
      .innerJoinAndSelect('participant.room', 'room')
      .innerJoinAndSelect('participant.user', 'user')
      .where('room.id = :roomId', { roomId })
      .andWhere('user.id = :userId', { userId })
      .getOne();
  }

  async findWithUser(id: Participant['id']) {
    return await this.participantRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findExistingRoom(userId: User['id'], recipientId: User['id']) {
    return await this.participantRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.user', 'user')
      .leftJoinAndSelect('p.room', 'room')
      .where('user.id IN (:...userIds)', { userIds: [userId, recipientId] })
      .getOne();
  }
}
