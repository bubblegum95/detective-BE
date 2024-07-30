import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Inject, Logger, UseGuards } from '@nestjs/common';
import { Namespace, Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserInfo } from '../utils/user-info.decorator';
import { User } from '../user/entities/user.entity';
import { ChatService } from './chat.service';
import { ClientNats, ClientProxy } from '@nestjs/microservices';

@UseGuards(JwtAuthGuard)
@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  @WebSocketServer()
  chat: Namespace;

  @WebSocketServer()
  notification: Namespace;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    @Inject('REDIS_SERVICE') private readonly redisClient: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.redisClient.connect();
    this.logger.log('Redis Server initialized');
  }

  async onApplicationBootstrap() {
    await this.redisClient.connect();
    this.logger.log('Nest Application Boot');
  }

  async afterInit() {
    // this.chat = this.server.of('/chat');
    // this.notification = this.server.of('/notification');
    this.logger.log('Websocket Server initialized');
  }

  handleConnection() {
    this.logger.log('socket connection');
  }

  handleDisconnect() {
    this.logger.log('socket disconnection');
  }

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() recipientId: number,
    @UserInfo() user: User,
  ) {
    try {
      const createdRoom = await this.chatService.createRoom(client, user, recipientId);

      if (!createdRoom) {
        throw new WsException('방 생성 및 사용자 초대를 할 수 없습니다.');
      }

      console.log('the room: ', createdRoom);
      client.join(createdRoom);
      client.emit('createdRoom', createdRoom);

      this.logger.log('handle create room');
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage('joinRooms')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @UserInfo() user: User) {
    try {
      const joinedRoom = await this.chatService.joinRoom(client, user);

      client.join(joinedRoom);

      this.logger.log('handle join room');
      const roomlist = this.server.sockets.adapter.rooms; // socket.io room
      console.log('roomlist: ', roomlist);
    } catch (error) {
      throw new WsException(`소켓을 룸에 연결할 수 없습니다. ${error.message}`);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number; roomName: string; message: string },
    @UserInfo() user: User,
  ) {
    try {
      const { roomId, roomName, message } = data;
      console.log(roomId, roomName, message);
      const savedMessage = await this.chatService.saveMassage(user, roomId, roomName, message);

      if (!savedMessage) {
        throw new WsException('메시지를 생성할 수 없습니다.');
      }

      this.publishMessage(savedMessage);
    } catch (error) {
      throw new WsException(`메시지를 보낼 수 없습니다. ${error.message}`);
    }
  }

  @SubscribeMessage('handlejoinRoomMessages')
  async handlejoinRoomMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number; roomName: string },
    @UserInfo() user: User,
  ): Promise<void> {
    try {
      const { roomId, roomName } = data;
      console.log('roomId: ', roomId, 'room name: ', roomName);

      this.logger.log('handle join room messages');
      const messages = await this.chatService.findRoomMessages(roomName, roomId, user);

      if (!messages) {
        throw new WsException('메시지를 가져올 수 없습니다.');
      }

      client.emit('joinRoomMessages', messages);
      this.logger.log('handle join room messages');
    } catch (error) {
      this.handleError(client, error);
    }
  }

  async publishMessage(message) {
    try {
      console.log(message);

      if (!message) {
        throw new WsException('보내실 메시지가 없습니다.');
      }
      // Redis로 전송
      this.redisClient.send({ cmd: 'chat_message' }, message).subscribe({
        next: async (response) => {
          // Redis 서버에서 채놀을 통해 받은 메시지를 소켓 클라이언트로 전송
          console.log('response: ', response);

          const { sender, content, timestamp, room } = response;
          this.server.to(room).emit('getMessage', { sender, content, timestamp });
          console.log('send message complete');
          // 채팅 알림 소켓 클라이언트로 전송하기. 네임스페이스 'notification'
          this.notification.emit('findMessageReceivers', { sender, room });
        },
        error: (err) => {
          this.logger.error('Error sending message to clients', err);
          throw new WsException('redis 전송 실패');
        },
      });

      this.logger.log('send message to Redis');
    } catch (error) {
      throw error;
    }
  }

  async publishFiles(data, room) {
    try {
      console.log(data);

      this.redisClient.send({ cmd: 'chat_files' }, data).subscribe({
        next: async (response) => {
          console.log(response);
          this.server.to(room).emit('getMessage', response);
          console.log(`send message to ${room}`);
        },
        error: (error) => {
          throw new WsException('파일을 전송할 수 없습니다.' + error.message);
        },
      });
    } catch (error) {
      throw error;
    }
  }

  handleError(client: Socket, error: any) {
    if (error instanceof WsException) {
      client.emit('errorToClient', { message: error.message });
    } else {
      this.logger.error(`Unexpected error from client ${client.id}: ${error.message}`);
      client.emit('errorToClient', { message: 'An unexpected error occurred' });
    }
  }

  @SubscribeMessage('notification')
  async handleNotification(
    @MessageBody() data: { type: string; message: string; senderId: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.chatService.handleNotification(data);
    this.server.emit('notification', data);
  }
}
