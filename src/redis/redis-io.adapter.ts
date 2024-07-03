import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly logger = new Logger(RedisIoAdapter.name);

  async connectToRedis(): Promise<void> {
    const publisher = createClient({ url: `redis://localhost:6379` });
    const subscriber = publisher.duplicate();

    await Promise.all([publisher.connect(), subscriber.connect()]);
    this.adapterConstructor = createAdapter(publisher, subscriber);

    this.logger.log('connect to Redis');
  }

  createIOServer(port: number, options?: ServerOptions): any {
    options = {
      ...options,
      cors: {
        origin: 'http://127.0.0.1:3001',
        methods: ['GET', 'POST'],
        credentials: true,
      },
    };

    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    this.logger.log(`create io server on port ${port}`);
    return server;
  }
}
