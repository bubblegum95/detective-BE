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
      .leftJoin('room.participants', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .addSelect(['u.nickname'])
      .where('u.id = :userId', { userId })
      .getMany();
  }

  async join(client: Socket, room: Room['name']) {
    client.join(room);
  }

  async joinRooms(client: Socket): Promise<Array<Room['name']>> {
    const user = client.data.user;
    const rooms = await this.findMany(user.id);
    return rooms.map(({ id, name, createdAt, participants }) => name);
  }
}
