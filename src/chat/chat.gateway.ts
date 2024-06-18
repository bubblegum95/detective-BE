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

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject('REDIS_PUBLISHER') private readonly redisPublisher: Redis,
    @Inject('REDIS_SUBSCRIBER') private readonly redisSubscriber: Redis,
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
  handleMessage(@MessageBody() message: string): void {
    this.redisPublisher.publish('messages', message);
  }
}
