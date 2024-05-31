import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Observable } from 'rxjs';
import { RedisClientType } from 'redis';

@WebSocketGateway(80, { namespace: 'chat', cors: { origin: '*' } })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly redisClient: RedisClientType;
  private readonly logger: Logger = new Logger('ChatGateway');

  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('웹소켓 서버 초기화');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected : ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client Connected : ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, payload: { sender: string; receiver: string; content: string }) {
    this.logger.debug(`Received message: ${JSON.stringify(payload)}`); // 디버그 로그
    try {
      await this.messageService.saveMessage(payload.content, payload.sender, payload.receiver);
      this.redisClient.publish('chat', JSON.stringify(payload));
      this.server.to(payload.receiver).emit('message', payload);
      this.logger.log(`Message sent to ${payload.receiver}`); // 일반 로그
    } catch (error) {
      this.logger.error('Error handling message', error.stack); // 오류 로그
    }
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: string): Observable<any> {
    return data;
  }
}
