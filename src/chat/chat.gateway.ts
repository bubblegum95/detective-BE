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
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
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
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatedRoomDto, CreateRoomDto } from './dto/create-room.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { SendMessageDto } from './dto/send-message.dto';

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

      await this.setUserSocket(user.email, client.id);
      await this.setUserIdSocket(user.id, client.id);
      await this.setSocketUserId(client.id, user.id);

      console.log('✅ socket clients connected');
    } catch (error) {
      console.error(error.message);
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    await this.clearUserSocket(user.email);
    await this.clearUserIdSocket(user.id);
    await this.clearSocketUserId(client.id);
    console.log('✅ socket clients disconnected');
  }

  async sendMessage(room: Room['name'], data: SendMessageDto) {
    this.server.to(room).emit('receiveMessage', data);
  }

  async createNotification(dto: CreateNotificationDto) {
    return await this.notificationService.create(dto);
  }

  async notify(clientId: Socket['id'], data: SendNotificationDto) {
    this.server.to(clientId).emit('notify', data); // notification
  }

  async setUserSocket(email: User['email'], clientId: Socket['id']) {
    return this.redisService.setUserSocket(email, clientId);
  }

  async getUserSocket(email: User['email']) {
    return this.redisService.getUserSocket(email);
  }

  async clearUserSocket(email: User['email']) {
    return this.redisService.clearUserSocket(email);
  }

  async setUserIdSocket(userId: User['id'], clientId: Socket['id']) {
    return this.redisService.setUserIdSocket(userId, clientId);
  }

  async getUserIdSocket(userId: User['id']) {
    return this.redisService.getUserIdSocket(userId);
  }

  async clearUserIdSocket(userId: User['id']) {
    return this.redisService.clearUserIdSocket(userId);
  }

  async setSocketUserId(clientId: Socket['id'], userId: User['id']) {
    return await this.redisService.setSocketUserId(clientId, userId);
  }

  async getSocketUserId(clientId: Socket['id']) {
    return await this.redisService.getSocketUserId(clientId);
  }

  async clearSocketUserId(client: Socket['id']) {
    return await this.redisService.clearSocketUserId(client);
  }

  async createReaders(
    sender: User['id'],
    roomId: Room['id'],
  ): Promise<{ room: Room['name']; readers: Array<User['id']> }> {
    const room = await this.roomService.findOne(roomId);
    const users = room.participants.map(({ id, createdAt, room, user }) => user); // room과 relation 되어 있는 모든 유저들
    let read: Set<User['id']>; // 수신자의 id
    users.map((user) => {
      read.add(user.id);
    });
    read.delete(sender); // 발신자는 제거
    const sockets: Set<Socket['id']> = this.server.sockets.adapter.rooms.get(room.name); // join 되어 있는 소켓들
    sockets.forEach(async (socket) => {
      const readerId = await this.redisService.getSocketUserId(socket); // join된 socket의 userid
      const includes = read.has(+readerId);
      includes && read.delete(+readerId); // socket join 되어 있지않은 userid만 남기기 => message.read(읽지 않은 사람들)
    });

    const readerArray = Array.from(read);
    return { room: room.name, readers: readerArray };
  }

  @SubscribeMessage('ping')
  ping(@ConnectedSocket() client: Socket, @MessageBody() hello: string) {
    console.log('client socket:', client, 'hello', hello);
  }

  @SubscribeMessage('findMyRoom')
  async findMyRoom(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;
    const rooms = await this.roomService.findMany(userId);
    const roomInfos = rooms.map(async (room) => {
      const lastMsg = await this.messageService.findLast(room.id);
      return {
        ...room,
        content: lastMsg,
      };
    });

    client.emit('getRooms', roomInfos);
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
      await this.clearSocketUserId(client.id);
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

      const { room, readers } = await this.createReaders(sender, roomId);
      const type = MessageType.Text;
      const message = await this.messageService.create({
        sender,
        type,
        content,
        room: roomId,
        read: readers,
      });

      const foundSender = await this.roomService.findUser(sender);
      const sendMessage = {
        id: message.id,
        sender: foundSender.nickname,
        type: message.type,
        content: message.content,
        timestamp: message.timestamp,
        read: message.read.length,
      };
      await this.sendMessage(room, sendMessage);

      for (const reader of message.read) {
        const notice = await this.createNotification({
          receiver: reader,
          sender: message.sender,
          content: message.content,
          room: message.room,
          isRead: false,
        });
        const clientId = await this.getUserIdSocket(reader);
        if (!client) {
          // socket 이 연결되어 있을 경우에만 알람 전송
          continue;
        }
        await this.notify(clientId, notice);
      }
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

  @SubscribeMessage('notReadNotification')
  async readNotNotifications(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;
    const notifications = await this.notificationService.findManyNotRead(userId);
    const data = await Promise.all(
      notifications.map(async ({ id, sender, receiver, room, timestamp, isRead }) => {
        const findSender = await this.roomService.findUser(sender);
        return {
          id,
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
  async isRead(@ConnectedSocket() client: Socket, @MessageBody() data: { notificationId: string }) {
    const user = client.data.user;
    await this.notificationService.isRead(data.notificationId);
  }
}
