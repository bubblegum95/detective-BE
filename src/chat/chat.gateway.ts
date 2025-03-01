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
import { Inject } from '@nestjs/common';
import { Namespace, Server, Socket } from 'socket.io';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisMessageDto } from './dto/redis-message.dto';
import { NotificationService } from './notification.service';
import { User } from '../user/entities/user.entity';
import { Room } from './entities/room.entity';
import { RoomService } from './room.service';
import { ParticipantService } from './participant.service';
import { MessageService } from './message.service';
import { MessageType } from './type/message.type';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { RedisService } from '../redis/redis.service';
import { Message } from './entities/message.entity';
import { RedisNotificationDto } from './dto/redis-notification.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatedRoomDto, CreateRoomDto } from './dto/create-room.dto';

@WebSocketGateway(3400, { cors: true })
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  @WebSocketServer()
  chat: Namespace;
  @WebSocketServer()
  notification: Namespace;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: ClientProxy,
    private readonly redisService: RedisService,
    private readonly roomService: RoomService,
    private readonly participantService: ParticipantService,
    private readonly notificationService: NotificationService,
    private readonly messageService: MessageService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      await this.redisClient.connect();
      console.log('✅ proxy redis clients module connected');
    } catch (error) {
      console.log(error.message);
    }
  }

  afterInit(server: Server) {
    try {
      if (!server) {
        throw new WsException('Can not create new Server Instance');
      }
      console.log('✅ socket initiation complated');
    } catch (error) {
      console.error(error.message);
    }
  }

  async handleConnection(client: Socket) {
    try {
      const authorization = client.handshake.auth.authorization;
      const [type, token] = authorization.split(' ');
      if (type !== 'Bearer') {
        throw new WsException('타입이 일치하지 않습니다.');
      }
      const SECRET_KEY = this.configService.get<string>('ACCESS_SECRET');
      const payload = this.jwtService.verify(token, {
        secret: SECRET_KEY,
      });
      const user = await this.roomService.findUser(payload.id);
      client.data.user = { id: user.id, sub: user.email, role: user.role };
      await this.redisService.setUserSocket(payload.email, client.id);
      console.log('✅ socket clients connected');
    } catch (error) {
      console.error(error.message);
    }
  }

  async handleDisconnect(client: Socket) {
    const email = client.data.user.sub;
    await this.redisService.clearUserSocket(email);
    console.log('✅ socket clients disconnected');
  }

  @SubscribeMessage('ping')
  ping(@ConnectedSocket() client: Socket, @MessageBody() hello: string) {
    console.log('client socket:', client, 'hello', hello);
  }
  // 초대하기
  @SubscribeMessage('invite')
  @ApiOperation({ description: '채팅방 초대하기', summary: '채팅방 초대하기' })
  @ApiBody({ description: 'invite', type: CreateRoomDto })
  @ApiResponse({ description: 'newRoom', type: CreatedRoomDto })
  async invite(@ConnectedSocket() client: Socket, @MessageBody() data: CreateRoomDto) {
    try {
      const inviter = client.data.user;
      const invitee = await this.roomService.findUserByEmail(data.email);
      const room = await this.roomService.create();
      if (!room) {
        throw new WsException('방을 생성할 수 없습니다.');
      }
      await this.participantService.create(room, inviter);
      await this.participantService.create(room, invitee);
      client.join(room.name);
      client.emit('newRoom', { room: room.id }); // newRoom
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('join')
  async join(@ConnectedSocket() client: Socket, @MessageBody() dto: { roomId: Room['id'] }) {
    try {
      const userId = client.data.user.id;
      const participated = await this.participantService.findByRoomUser(dto.roomId, userId);
      if (!participated) {
        throw new WsException('해당 채팅방의 참여자가 아닙니다.');
      }
      const room = participated.room.name;
      client.join(room);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('leave')
  async leave(@ConnectedSocket() client: Socket, @MessageBody() dto: { roomId: Room['id'] }) {
    try {
      const userId = client.data.user.id;
      const participated = await this.participantService.findByRoomUser(dto.roomId, userId);
      if (!participated) {
        throw new WsException('해당 채팅방의 참여자가 아닙니다.');
      }
      const room = participated.room.name;
      client.leave(room);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('sendMessage')
  async message(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: Room['id']; content: string },
  ) {
    try {
      const sender = client.data.user.id;
      const { roomId, content } = data;
      const existing = await this.participantService.findByRoomUser(roomId, sender);
      if (!existing) {
        throw new WsException('해당 채팅방의 초대자가 아닙니다.');
      }

      const type = MessageType.Text;
      const room = await this.roomService.findOne(roomId);
      const users = room.participants.map(({ id, createdAt, room, user }) => user);
      let read: Array<User['id']>;
      users.map((user) => read.push(user.id));
      const message = await this.messageService.create({
        sender,
        type,
        content,
        room: roomId,
        read,
      });

      const foundSender = await this.roomService.findUser(sender);
      const redisMessage: RedisMessageDto = {
        id: message._id,
        sender: foundSender.nickname,
        type,
        content,
        timestamp: message.timestamp,
        room: room.name,
        read: read.length - 1,
      };
      this.redisClient.emit('message', redisMessage);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('findMessages')
  async receiveMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: Room['id']; page: number; limit: number },
  ): Promise<void> {
    try {
      const { roomId, page, limit } = data;
      const messages = await this.messageService.findMany(roomId, page, limit);
      const result = messages.map(async ({ _id, type, sender, content, read, timestamp }) => {
        const foundSender = await this.roomService.findUser(sender);
        return {
          id: _id,
          type,
          sender: foundSender.nickname,
          content,
          read: read.length - 1,
          timestamp,
        };
      });
      client.emit('messages', result); // messages
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('readMessage')
  async readMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { id: Message['_id'] },
  ) {
    const userId = client.data.user.id;
    await this.messageService.updateRead(data.id, userId);
  }

  @EventPattern('message')
  async subscribeMessage(dto: RedisMessageDto) {
    console.log('data', dto);
    this.server.to(dto.room).emit('receiveMessage', dto); // receiveMessage
  }

  @EventPattern('notification')
  async subscribeNotification(socketId: Socket['id'], dto: RedisNotificationDto) {
    console.log('data', dto);
    this.server.to(socketId).emit('receiveNotification', dto); // receiveMessage
  }

  async createNotification(dto: CreateNotificationDto) {
    return await this.notificationService.createAndReturn(dto);
  }

  async notify(clientId: Socket['id'], data: RedisNotificationDto) {
    this.server.to(clientId).emit('notify', data); // notification
  }

  async findUserSocket(email: User['email']) {
    return this.redisService.findUserSocket(email);
  }

  async notifyReceiverOfMessage(sender: User, roomId: Room['id']) {
    const room = await this.roomService.findOne(roomId);
    const receivers = room.participants.map(({ id, room, user }) => user);
    for (const receiver of receivers) {
      const notification = await this.createNotification({
        receiver: receiver.id,
        sender: sender.id,
        room: room.id,
        isRead: false,
      });
      const clientId = await this.redisService.findUserSocket(receiver.email);
      if (!clientId) {
        throw new WsException('client id를 찾을 수 없습니다. 다시 로그인해주세요.');
      }
      await this.notify(clientId, {
        id: notification['id'],
        content: `${sender.nickname} 님이 메시지를 보냈습니다.`,
        room: room.id,
        timestamp: notification.timestamp,
      });
    }
  }

  @SubscribeMessage('notReadNotification')
  async readNotNotifications(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;
    const notifications = await this.notificationService.findManyNotRead(userId);
    const data = await Promise.all(
      notifications.map(async ({ _id, sender, receiver, room, timestamp, isRead }) => {
        const findSender = await this.roomService.findUser(sender);
        return {
          id: _id,
          sender: findSender.nickname,
          room,
          timestamp,
          isRead,
        };
      }),
    );
    client.emit('isNotRead', data);
  }

  @SubscribeMessage('readNotification') // 읽은 알림 처리하기
  async isRead(@ConnectedSocket() client: Socket, @MessageBody() notificationId: string) {
    const user = client.data.user;
    const data = await this.notificationService.isRead(notificationId);
  }
}
