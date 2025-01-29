import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Room } from '../chat/entities/room.entity';
import { Participant } from './entities/participant.entity';
import bcrypt from 'bcrypt';
import { S3Service } from '../s3/s3.service';
import { File } from '../s3/entities/s3.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
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
    try {
      return await this.userRepository.findOne({ where: { id }, relations: ['detective', 'file'] });
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async verifyPassword(inputPw: string, comparedPw: string) {
    return bcrypt.compareSync(inputPw, comparedPw);
  }

  async saveFile(path: string) {
    return await this.s3Service.savePath(path);
  }

  async updateFile(file: File) {
    return await this.s3Service.updateFile(file);
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
        await this.updateFile(file);
        return 1;
      }
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, dto: { nickname?: string; password?: string; profile?: number }) {
    try {
      console.log('start to generate user information');
      const result = await this.userRepository.update(
        { id },
        {
          ...dto,
        },
      );
      console.log('generated map:', result.generatedMaps, 'affected:', result.affected);
      return result.affected;
    } catch (error) {
      console.error('error message:', error);
      throw error;
    }
  }

  async returnFoundUser(id: number) {
    const data = await this.findOneById(id);
    console.log(data);
    const newCreated = data.createdAt.toString().split(' ', 4).reverse().join(' ');
    return {
      name: data.name,
      email: data.email,
      nickname: data.nickname,
      phoneNumber: data.phoneNumber,
      createdAt: newCreated,
      detective: data.detective,
      profile: data.file,
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
