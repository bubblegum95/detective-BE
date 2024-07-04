// src/redis/redis.service.ts
import { Controller, Inject, Injectable, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RedisContext, ClientProxy } from '@nestjs/microservices';

@Controller()
export class RedisController {
  private readonly logger = new Logger(RedisController.name);
  constructor(@Inject('REDIS_SERVICE') private readonly client: ClientProxy) {}

  @MessagePattern({ cmd: 'chat_message' })
  handleMessage(
    @Payload()
    data: {
      sender: string;
      content: string;
      timestamp: string;
      room: string;
    },
    @Ctx() context: RedisContext,
  ) {
    this.logger.log(`Channel: ${context.getChannel()}`);
    // 메시지 처리 로직
    return {
      sender: data.sender,
      content: data.content,
      timestamp: data.timestamp,
      room: data.room,
    };
  }
}
