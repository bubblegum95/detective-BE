// src/redis/redis.service.ts
import { Controller, Inject, Injectable, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RedisContext, ClientProxy } from '@nestjs/microservices';
import { MessageType } from '../chat/type/message.type';

@Controller()
export class RedisController {
  private readonly logger = new Logger(RedisController.name);

  @MessagePattern({ cmd: 'chat_message' })
  async handleMessage(
    @Payload()
    data: {
      sender: string;
      type: MessageType;
      content: string;
      timestamp: string;
      room: string;
    },
    @Ctx() context: RedisContext,
  ) {
    this.logger.log(`Channel: ${context.getChannel()}`);
    try {
      return {
        sender: data.sender,
        type: data.type,
        content: data.content,
        timestamp: data.timestamp,
        room: data.room,
      };
    } catch (error) {
      console.error(error.message);
      throw error;
    }
  }
}
