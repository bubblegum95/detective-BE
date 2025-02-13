import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';

@Global()
@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync<RedisClientOptions>({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({ url: `redis://${configService.get<string>('REDIS_HOST')}:6379` }),
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<string>('REDIS_PORT'),
      }),
      isGlobal: true,
    }),
    ClientsModule.registerAsync([
      {
        name: 'REDIS_CLIENT',
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
  controllers: [],
  providers: [],
  exports: [ClientsModule],
})
export class RedisModule {}
