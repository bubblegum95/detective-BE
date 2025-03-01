import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { User } from '../user/entities/user.entity';
import { Socket } from 'socket.io';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async findUserSocket(email: User['email']) {
    return await this.cacheManager.get<string>(email);
  }

  async setUserSocket(email: User['email'], clientId: Socket['id']) {
    return await this.cacheManager.set(email, clientId);
  }

  async clearUserSocket(email: User['email']) {
    return await this.cacheManager.del(email);
  }
}
