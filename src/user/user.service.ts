import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}
