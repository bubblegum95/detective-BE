import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private cluster: Redis.Cluster;

  onModuleInit() {
    this.cluster = new Redis.Cluster(
      [
        { host: '127.0.0.1', port: 6000 },
        { host: '127.0.0.1', port: 6001 },
        { host: '127.0.0.1', port: 6002 },
        { host: '127.0.0.1', port: 6003 },
        { host: '127.0.0.1', port: 6004 },
        { host: '127.0.0.1', port: 6005 },
      ],
      {
        natMap: {
          '127.0.0.1:6000': { host: '127.0.0.1', port: 6000 },
          '127.0.0.1:6001': { host: '127.0.0.1', port: 6001 },
          '127.0.0.1:6002': { host: '127.0.0.1', port: 6002 },
          '127.0.0.1:6003': { host: '127.0.0.1', port: 6003 },
          '127.0.0.1:6004': { host: '127.0.0.1', port: 6004 },
          '127.0.0.1:6005': { host: '127.0.0.1', port: 6005 },
        },
      },
    );
  }

  onModuleDestroy() {
    this.cluster.quit();
  }

  getCluster() {
    return this.cluster;
  }
}
