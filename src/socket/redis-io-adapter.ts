import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private readonly configService: ConfigService;

  constructor(private readonly app: INestApplication) {
    super();
    this.configService = this.app.get(ConfigService);
  }

  // Redis pub/sub adapter 생성
  async connectToRedis(host: string, port: number): Promise<void> {
    try {
      const pubClient = createClient({ url: `redis://${host}:${port}` });
      const subClient = pubClient.duplicate();
      await Promise.all([pubClient.connect(), subClient.connect()]);

      const ping = await pubClient.ping();
      console.log('ping: ', ping);

      this.adapterConstructor = createAdapter(pubClient, subClient);
      if (!this.adapterConstructor) {
        throw new Error('redis adapter was not created!!!');
      }
    } catch (error) {
      throw error;
    }
  }
  // socket.io 서버 생성
  createIOServer(port: number, options?: ServerOptions): any {
    try {
      console.log('start to create io server');
      if (!this.adapterConstructor) {
        throw new Error('Redis adapter is not initialized');
      }
      const CLIENT_HOST = this.configService.get<string>('CLIENT_HOST');
      const CLIENT_PORT = this.configService.get<number>('CLIENT_PORT');
      const server = super.createIOServer(port, {
        ...options,
        cors: {
          origin: [`http://${CLIENT_HOST}:${CLIENT_PORT}`, `http://127.0.0.1:${CLIENT_PORT}`],
          credentials: true,
          methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
          allowedHeaders: ['authorization', 'Content-Type'],
        },
      });
      server.adapter(this.adapterConstructor);
      console.log('✅ Redis Adapter Applied to Server');
      return server;
    } catch (error) {
      throw error;
    }
  }
}
