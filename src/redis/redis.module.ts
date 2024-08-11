import { Module } from '@nestjs/common';
import { RedisIoAdapter } from './redis-io.adapter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisController } from './redis.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    RedisIoAdapter,
    ClientsModule.registerAsync([
      {
        name: 'REDIS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get<string>('REDIS_HOST'),
            port: configService.get<number>('REDIS_PORT'),
          },
        }),
      },
    ]),
  ],
  controllers: [RedisController],
  providers: [RedisIoAdapter],
  exports: [RedisIoAdapter, ClientsModule],
})
export class RedisModule {}
