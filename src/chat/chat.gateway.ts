import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';
import { ChatService } from './chat.service';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('REDIS_PUBLISHER') private readonly redisPublisher: Redis,
    @Inject('REDIS_SUBSCRIBER') private readonly redisSubscriber: Redis,
    private readonly chatService: ChatService,
  ) {}

  onModuleInit() {
    this.redisSubscriber.subscribe('messages', (err, count) => {
      if (err) {
        console.error('Failed to subscribe: %s', err.message);
      } else {
        console.log(
          `Subscribed successfully! This client is currently subscribed to ${count} channels.`,
        );
      }
    });

    this.redisSubscriber.on('message', (channel, message) => {
      if (channel === 'messages') {
        this.server.emit('message', message);
      }
    });
  }

  afterInit(server: Server) {
    console.log('Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { content: string; sender: string; receiver: string },
  ): Promise<void> {
    const { content, sender, receiver } = data;
    await this.chatService.createMessage(content, sender, receiver);
    this.redisPublisher.publish('messages', JSON.stringify(data));
  }
}
