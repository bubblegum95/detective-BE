import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_PUBLISHER',
      useFactory: () => {
        const publisher = new Redis({
          host: '127.0.0.1',
          port: 6379, // Redis가 실행 중인 포트
        });
        return publisher;
      },
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      useFactory: () => {
        const subscriber = new Redis({
          host: '127.0.0.1',
          port: 6379, // Redis가 실행 중인 포트
        });
        return subscriber;
      },
    },
  ],
  exports: ['REDIS_PUBLISHER', 'REDIS_SUBSCRIBER'],
})
export class RedisModule {}
