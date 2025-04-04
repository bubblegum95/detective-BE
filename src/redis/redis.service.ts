import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { User } from '../user/entities/user.entity';
import { Socket } from 'socket.io';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Detective } from '../detective/entities/detective.entity';
import { Participant } from '../chat/entities/participant.entity';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async setUserSocket(email: User['email'], clientId: Socket['id']) {
    return await this.cacheManager.set(`email:${email}`, clientId);
  }

  async getUserSocket(email: User['email']) {
    return await this.cacheManager.get<string>(`email:${email}`);
  }

  async clearUserSocket(email: User['email']) {
    return await this.cacheManager.del(`email:${email}`);
  }

  async setUserIdSocket(userId: User['id'], clientId: Socket['id']) {
    return await this.cacheManager.set(`id:${userId}`, clientId);
  }

  async getUserIdSocket(userId: User['id']) {
    return await this.cacheManager.get<string>(`id:${userId}`);
  }

  async clearUserIdSocket(userId: User['id']) {
    return await this.cacheManager.del(`id:${userId}`);
  }

  async setSocketParticipant(clientId: Socket['id'], participantId: Participant['id']) {
    return await this.cacheManager.set(`socket:${clientId}`, participantId);
  }

  async getSocketParticipant(clientId: Socket['id']) {
    return await this.cacheManager.get<string>(`socket:${clientId}`);
  }

  async clearSocketParticipant(clientId: Socket['id']) {
    return await this.cacheManager.del(`socket:${clientId}`);
  }

  async setDetectives(take: number, skip: number, detectives: Array<Partial<Detective>>) {
    return await this.cacheManager.set(`detectives:${take}:${skip}`, detectives);
  }

  async getDetectives(take: number, skip: number): Promise<Array<Partial<Detective>>> {
    return await this.cacheManager.get(`detectives:${take}:${skip}`);
  }
}
