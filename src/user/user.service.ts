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
      return await this.userRepository.findOne({
        where: { id },
        relations: ['detective', 'file', 'participants', 'participants.room'],
      });
    } catch (error) {
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
      participants: data.participants,
    };
  }

  async findUserNameById(id: number): Promise<string> {
    const userName = await this.userRepository.findOne({
      where: { id },
      select: { nickname: true },
    });
    return userName.nickname;
  }
}
