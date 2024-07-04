import { Module } from '@nestjs/common';
import { RedisIoAdapter } from './redis-io.adapter';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    RedisIoAdapter,
    ClientsModule.register([
      {
        name: 'REDIS_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        },
      },
    ]),
  ],
  providers: [RedisIoAdapter],
  exports: [RedisIoAdapter],
})
export class RedisModule {}
