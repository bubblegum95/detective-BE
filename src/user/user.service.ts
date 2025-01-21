import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Room } from '../chat/entities/room.entity';
import { Participant } from './entities/participant.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  logger: Logger;

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

  async findOneById(id: number) {
    const data = await this.userRepository.findOne({ where: { id }, relations: ['detective'] });
    console.log(data);

    return {
      name: data.name,
      email: data.email,
      nickname: data.nickname,
      phoneNumber: data.phoneNumber,
      createdAt: data.createdAt,
      detective: data.detective,
    };
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
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.participants', 'participant')
        .leftJoinAndSelect('participant.user', 'user')
        .where((qb) => {
          const subQuery = qb
            .subQuery()
            .select('p.roomId')
            .from(Participant, 'p')
            .where('p.userId = :userId')
            .getQuery();
          return 'room.id IN ' + subQuery;
        })
        .setParameter('userId', userId)
        .getMany();

      console.log('rooms', rooms);
      const roomLists = [];
      const participantLists = [];
      rooms.map((room) => {
        room.participants.map((participant) => {
          participantLists.push(participant.user.nickname);
        });

        const roomlist = {
          id: room.id.toString(),
          name: room.name,
          createdAt: room.createdAt,
          participants: participantLists,
        };

        roomLists.push(roomlist);
      });

      console.log('roomList: ', roomLists);

      return roomLists;
    } catch (error) {
      throw error;
    }
  }
}
