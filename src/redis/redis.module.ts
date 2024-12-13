import { Module } from '@nestjs/common';
import { RedisIoAdapter } from './redis-io.adapter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisController } from './redis.controller';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';

@Module({
  imports: [
    ConfigModule,
    RedisIoAdapter,
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<number>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
      }),
      isGlobal: true,
    }),
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
  exports: [RedisIoAdapter, ClientsModule, CacheModule],
})
export class RedisModule {}
