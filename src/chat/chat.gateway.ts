import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserInfo } from '../utils/user-info.decorator';
import { User } from '../user/entities/user.entity';
import { ChatService } from './chat.service';
import { ClientNats, ClientProxy } from '@nestjs/microservices';

@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    @Inject('REDIS_SERVICE') private readonly client: ClientProxy,
  ) {
    // this.receiveMessages('message');
  }

  async onModuleInit() {
    await this.client.connect();
    this.logger.log('Redis Server initialized');
  }

  async onApplicationBootstrap() {
    await this.client.connect();
    this.logger.log('Nest Application Boot');
  }

  async afterInit(server: Server) {
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
    const createdRoom = await this.chatService.createRoom(client, user, recipientId);
    client.join(createdRoom);
    client.emit('createdRoom', createdRoom);
    this.logger.log('handle create room');
  }

  @SubscribeMessage('joinRooms')
  async handleJoinRoom(@ConnectedSocket() client: Socket, @UserInfo() user: User) {
    const joinedRoom = await this.chatService.joinRoom(client, user);

    client.join(joinedRoom);

    this.logger.log('handle join room');
    const roomlist = this.server.sockets.adapter.rooms; // socket.io room
    console.log('roomlist: ', roomlist);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; message: string },
    @UserInfo() user: User,
  ) {
    // message 생성
    const message = await this.chatService.saveMassage(client, data, user);
    // Redis로 전송
    this.client.send({ cmd: 'chat_message' }, message).subscribe({
      next: (response) => {
        // Redis Microservice에서 받은 메시지를 클라이언트로 전송
        const { sender, content, timestamp, room } = response;
        this.server.to(room).emit('getMessage', { sender, content, timestamp, room });
        this.logger.log('Message sent to clients');
      },
      error: (err) => {
        this.logger.error('Error sending message to clients', err);
      },
    });
    this.logger.log('send message to Redis');
  }

  @SubscribeMessage('handlejoinRoomMessages')
  async handlejoinRoomMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
    @UserInfo() user: User,
  ): Promise<void> {
    this.logger.log('handle join room messages');
    const messages = await this.chatService.findRoomMessages(client, roomId, user);

    client.emit('joinRoomMessages', messages);
    this.logger.log('handle join room messages');
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
