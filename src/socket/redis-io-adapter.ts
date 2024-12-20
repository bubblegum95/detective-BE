import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private redisModule: ReturnType<typeof createAdapter>;

  async connectToRedis(host: string, port: number): Promise<void> {
    try {
      console.log('start to create redis client');
      const pubClient = createClient({ url: `redis://redis:6379` });
      const subClient = pubClient.duplicate();
      await Promise.all([pubClient.connect(), subClient.connect()]); // Redis Socket (TCP) 연결
      pubClient.ping();
      console.log('start to adapter constructor');
      this.redisModule = createAdapter(pubClient, subClient);
      if (!this.redisModule) {
        throw new Error('redis adapter was not created!!!');
      }
    } catch (error) {
      throw error;
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    try {
      if (!this.redisModule) {
        throw new Error('Redis adapter is not initialized');
      }
      const server = super.createIOServer(port, options);
      server.adapter(this.redisModule);
      return server;
    } catch (error) {
      throw error;
    }
  }
}
