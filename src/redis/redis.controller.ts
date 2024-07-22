// src/redis/redis.service.ts
import { Controller, Inject, Injectable, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RedisContext, ClientProxy } from '@nestjs/microservices';
import axios from 'axios';

@Controller()
export class RedisController {
  private readonly logger = new Logger(RedisController.name);
  constructor(@Inject('REDIS_SERVICE') private readonly client: ClientProxy) {}

  @MessagePattern({ cmd: 'chat_message' })
  async handleMessage(
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
    const webhookUrl = 'https://localhost:3000/notification';
    try {
      await axios.post(webhookUrl, { channel: 'chat_message', data });
      console.log('Webhook called successfully');

      return {
        sender: data.sender,
        content: data.content,
        timestamp: data.timestamp,
        room: data.room,
      };
    } catch (error) {
      console.error('Error calling webhook:', error);
      throw error;
    }
  }
}
