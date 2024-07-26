import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Room } from '../chat/entities/room.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    private readonly dataSource: DataSource,
  ) {}

  async findUserbyId(userId: number) {
    try {
      const foundUser = await this.userRepository.findOneBy({ id: userId });

      if (!foundUser) {
        throw new UnauthorizedException('일치하는 회원 정보가 없습니다.');
      }

      return foundUser;
    } catch (error) {
      throw error;
    }
  }

  async findUserbyEmail(email: string) {
    console.log('find user by email: ', email);
    const foundUser = await this.userRepository.findOne({ where: { email } });
    return foundUser;
  }

  async findUser(email: string) {
    try {
      const foundUser = await this.userRepository.findOne({
        where: { email },
        select: { id: true, email: true, password: true },
      });

      if (!foundUser) {
        throw new UnauthorizedException('일치하는 회원정보가 없습니다.');
      }

      return foundUser;
    } catch (error) {
      throw error;
    }
  }

  async findOneById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id }, relations: ['detective'] });
  }

  async findUserNameById(id: number): Promise<string> {
    const userName = await this.userRepository.findOne({
      where: { id },
      select: { nickname: true },
    });
    return userName.nickname;
  }

  async getAllChatRooms(user: User) {
    const userId = user.id;
    try {
      const rooms = await this.dataSource
        .getRepository(Room)
        .createQueryBuilder()
        .select(['room.id', 'room.name', 'room.createdAt', 'user.nickname'])
        .from(Room, 'room')
        .leftJoin('room.user', 'user')
        .where('user.id != :userId', { userId })
        .getMany();

      console.log(rooms);

      return rooms;
    } catch (error) {
      throw error;
    }
  }

  async getOutOfRoom(user: User, roomId: number) {}
}
