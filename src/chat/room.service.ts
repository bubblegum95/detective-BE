import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { DataSource, Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}

  async findUser(userId: User['id']) {
    return await this.userService.findOneById(userId);
  }

  async findUserNickname(userId: User['id']) {
    const user = await this.userService.findOneByIdSelectNickname(userId);
    return user.nickname;
  }

  async findUserByEmail(email: User['email']) {
    return await this.userService.findOneByEmail(email);
  }

  async create(): Promise<Room> {
    const name = uuidv4();
    return await this.roomRepository.save({ name });
  }

  async findOne(id: Room['id']) {
    return await this.roomRepository.findOne({
      where: { id },
      relations: ['participants', 'participants.user'],
    });
  }

  async findMany(userId: User['id']) {
    return await this.roomRepository
      .createQueryBuilder('room')
      .innerJoinAndSelect('room.participants', 'participants')
      .innerJoinAndSelect('participants.user', 'user')
      .leftJoinAndSelect('room.participants', 'allParticipants')
      .leftJoin('allParticipants.user', 'allUsers')
      .where('user.id = :userId', { userId })
      .addSelect(['allUsers.id', 'allUsers.nickname'])
      .getManyAndCount();
  }
}
