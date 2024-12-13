import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Logger } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  constructor(
    private readonly app: any,
    private readonly clientPort: number,
  ) {
    super(app);
  }

  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly logger = new Logger(RedisIoAdapter.name);

  async connectToRedis(host: string, port: number): Promise<void> {
    const publisher = createClient({ url: `redis://${host}:${port}` });
    const subscriber = publisher.duplicate();

    await Promise.all([publisher.connect(), subscriber.connect()]);
    this.adapterConstructor = createAdapter(publisher, subscriber);

    this.logger.log('connect to Redis');
  }

  // socket.io 서버 생성
  createIOServer(port: number, options?: ServerOptions): any {
    options = {
      ...options,
      cors: {
        origin: `http://127.0.0.1:${port}`, // server port
        methods: ['GET', 'POST'],
        credentials: true,
      },
    };

    const server = super.createIOServer(this.clientPort, options);
    server.adapter(this.adapterConstructor);

    this.logger.log(`create io server on port ${this.clientPort}`);
    return server;
  }
}
