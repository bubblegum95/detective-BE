import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_PUBLISHER',
      useFactory: () => {
        const publisher = new Redis();
        return publisher;
      },
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      useFactory: () => {
        const subscriber = new Redis();
        return subscriber;
      },
    },
  ],
  exports: ['REDIS_PUBLISHER', 'REDIS_SUBSCRIBER'],
})
export class RedisModule {}
