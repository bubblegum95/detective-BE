import { Module } from '@nestjs/common';
import { RedisIoAdapter } from './redis-io.adapter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisController } from './redis.controller';

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
  controllers: [RedisController],
  providers: [RedisIoAdapter],
  exports: [RedisIoAdapter],
})
export class RedisModule {}
