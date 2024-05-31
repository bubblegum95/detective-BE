import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from 'socket.io-redis';
import { INestApplicationContext } from '@nestjs/common';
import { RedisService } from './redis.service';

export class RedisIoAdapter extends IoAdapter {
  private adapter: ReturnType<typeof createAdapter>;

  constructor(app: INestApplicationContext) {
    super(app);
  }

  setRedisService(redisService: RedisService) {
    const cluster = redisService.getCluster();
    this.adapter = createAdapter({
      pubClient: cluster,
      subClient: cluster.duplicate(),
    });
  }

  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapter);
    return server;
  }
}
