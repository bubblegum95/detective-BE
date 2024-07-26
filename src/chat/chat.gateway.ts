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
import { Inject, Logger, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserInfo } from '../utils/user-info.decorator';
import { User } from '../user/entities/user.entity';
import { ChatService } from './chat.service';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../s3/s3.service';
import { NotificationType } from './type/notification.type';

@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly s3Service: S3Service,
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
    @MessageBody() data: { room: string; message?: string },
    @UserInfo() user: User,
  ) {
    try {
      const { room, message } = data;
      console.log(message);
      const savedmessage = await this.chatService.saveMassage(user, room, message);
      this.publishMessage(savedmessage, user.id);
    } catch (error) {
      this.logger.log(error.message);
    }
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

  async publishMessage(message, userId: number) {
    console.log(message);
    // Redis로 전송
    this.redisClient.send({ cmd: 'chat_message' }, message).subscribe({
      next: async (response) => {
        // Redis 서버에서 채놀을 통해 받은 메시지를 소켓 클라이언트로 전송
        const { sender, content, timestamp, room } = response;
        this.server.to(room).emit('getMessage', { sender, content, timestamp, room });
        // 채팅 알림 소켓 클라이언트로 전송
        const receivers = await this.chatService.findMessageReceiver(room, userId);
        for (const receiver of receivers) {
          const data = {
            type: NotificationType.Message,
            sender: sender,
            receiver: receiver,
            content: `${sender} 님이 메시지를 보내셨습니다.`,
          };

          const notification = await this.chatService.saveNotification(data);
          this.server.to(room).emit('notification', notification);
        }
        this.logger.log('Message sent to clients');
      },
      error: (err) => {
        this.logger.error('Error sending message to clients', err);
      },
    });
    this.logger.log('send message to Redis');
  }

  @SubscribeMessage('readNotNotifications')
  async readNotNotifications(@ConnectedSocket() client: Socket, @UserInfo() user: User) {
    const data = await this.chatService.getNotReadNotification(user);
    client.emit('isNotReadNotifications', data);
  }

  @SubscribeMessage('isRead') // 읽은 알림 처리하기
  async isRead(
    @ConnectedSocket() client: Socket,
    @UserInfo() user: User,
    @MessageBody() id: string,
  ) {
    const data = await this.chatService.isReadNotification(id);
  }
}
