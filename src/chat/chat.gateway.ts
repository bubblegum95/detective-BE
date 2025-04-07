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
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatedRoomDto, CreateRoomDto } from './dto/create-room.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Participant } from './entities/participant.entity';
import { Message } from './entities/message.entity';
import { Notice } from './entities/notice.entity';

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

      console.log('✅ socket clients connected');
    } catch (error) {
      console.error(error.message);
    }
  }

  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    await this.clearUserSocket(user.email);
    await this.clearUserIdSocket(user.id);
    await this.clearSocketParticipant(client.id);
    console.log('✅ socket clients disconnected');
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

  async setSocketParticipant(clientId: Socket['id'], userId: User['id']) {
    return await this.redisService.setSocketParticipant(clientId, userId);
  }

  async getSocketParticipant(clientId: Socket['id']) {
    return await this.redisService.getSocketParticipant(clientId);
  }

  async clearSocketParticipant(client: Socket['id']) {
    return await this.redisService.clearSocketParticipant(client);
  }

  async sendMessage(room: Room['name'], data: SendMessageDto) {
    this.server.in(room).emit('receiveMessage', data);
  }

  async sendNotice(clientId: Socket['id'], data: SendNotificationDto) {
    this.server.to(clientId).emit('receiveNotice', data); // notification
  }

  async createNotice(dto: CreateNotificationDto) {
    return await this.notificationService.create(dto);
  }

  async findNotice(noticeId: Notice['id']) {
    return await this.notificationService.findOne(noticeId);
  }

  async findNickname(userId: User['id']) {
    return await this.roomService.findUserNickname(userId);
  }

  async toKoreaTime(timestamp: Date | string) {
    return new Date(timestamp).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
    });
  }

  findJoinSocket(room: Room['name']): Set<Socket['id']> {
    return this.server.sockets.adapter.rooms.get(room);
  }

  async createNotReaders(
    sender: Participant['id'],
    roomId: Room['id'],
  ): Promise<{ room: Room; readers: Array<Participant['id']> }> {
    try {
      let read = new Set<Participant['id']>(); // 수신자의 id set
      const room = await this.roomService.findOne(+roomId);
      room.participants.map(({ id }) => read.add(+id));
      read.delete(+sender); // 발신자는 제거
      const sockets: Set<Socket['id']> = this.findJoinSocket(room.name); // join 되어 있는 소켓들

      if (!sockets) {
        return { room, readers: Array.from(read) };
      }

      sockets.forEach(async (socket) => {
        const participantId = await this.redisService.getSocketParticipant(socket); // join된 socket의 userid
        const includes = read.has(+participantId);
        includes && read.delete(+participantId); // socket join 되어 있으면 reader에서 삭제
      });

      const readerArray = Array.from(read);
      return { room, readers: readerArray };
    } catch (error) {
      throw error;
    }
  }

  @SubscribeMessage('ping')
  ping(@ConnectedSocket() client: Socket, @MessageBody() hello: string) {
    console.log('client socket:', client, 'hello', hello);
  }

  @SubscribeMessage('getMyRooms')
  async findMyRoom(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;
    const rooms = await this.roomService.findMany(userId);
    const roomInfos = await Promise.all(
      rooms.map(async (room) => {
        const me = room.participants.find(({ user }) => user.id === userId);
        const participants = room.participants.filter(({ user }) => user.id !== userId);
        const participantsName = participants.map(({ user }) => user.nickname);
        const latestMessage = await this.messageService.findLastOne(room.id);
        return {
          roomId: room.id,
          me: me.id,
          participants: participantsName,
          latestMessage: latestMessage ? latestMessage : null,
        };
      }),
    );
    console.log('rooms: ', rooms);

    client.emit('rooms', roomInfos);
  }

  // 초대하기. 만약에 room이 있으면 => 조인 => 메시지 가져오기 가 한번에 이루어져야 함.
  @SubscribeMessage('invite')
  @ApiOperation({ description: '채팅방 초대하기', summary: '채팅방 초대하기' })
  @ApiBody({ description: 'invite', type: CreateRoomDto })
  @ApiResponse({ description: 'newRoom', type: CreatedRoomDto })
  async invite(@ConnectedSocket() client: Socket, @MessageBody() data: CreateRoomDto) {
    try {
      let room: Room;
      const inviter = client.data.user;
      const invitee = await this.roomService.findUserByEmail(data.email);
      const alreadyHasRoom = await this.participantService.findExistingRoom(inviter.id, invitee.id);
      if (alreadyHasRoom) {
        // 룸이 이미 존재하는 경우
        room = alreadyHasRoom.room;
        client.join(room.name);
      } else {
        // 존재하는 룸이 없는 경우
        room = await this.roomService.create();
        await this.participantService.create(room, inviter);
        await this.participantService.create(room, invitee);
        client.join(room.name);
      }
      client.emit('room', { roomId: room.id });
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('join')
  async join(@ConnectedSocket() client: Socket, @MessageBody() dto: { roomId: Room['id'] }) {
    try {
      const userId = client.data.user.id;
      const participant = await this.participantService.findByRoomUser(dto.roomId, userId);
      if (!participant) {
        throw new WsException('해당 채팅방의 참여자가 아닙니다.');
      }
      await this.setSocketParticipant(client.id, participant.id);
      const room = participant.room.name;
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
      await this.clearSocketParticipant(client.id);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('getOut')
  async getOut(@ConnectedSocket() client: Socket, @MessageBody() dto: { roomId: Room['id'] }) {
    try {
      const userId = client.data.user.id;
      const participant = await this.participantService.findOneByUserRoom(userId, dto.roomId);
      await this.participantService.delete(participant.id);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('getMessages')
  async getMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: Room['id']; page: number; limit: number },
  ): Promise<void> {
    try {
      const { roomId, page, limit } = data;
      const messages = await this.messageService.findMany(roomId, page, limit);
      const result = await Promise.all(
        messages.map(async ({ id, type, sender, content, notRead, timestamp }) => {
          const koreaTime = await this.toKoreaTime(timestamp);
          return {
            id,
            type,
            sender: sender.user.nickname,
            senderId: sender.id,
            content,
            notRead,
            timestamp: koreaTime,
          };
        }),
      );
      client.emit('messages', { messages: result }); // messages
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('readMessage')
  async readMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { id: Message['id'] }) {
    const participantId = await this.getSocketParticipant(client.id);
    await this.messageService.update(data.id, +participantId);
    const result = await this.messageService.findOneByIdWithRoom(data.id);
    const room = result.room.name;
    this.server.in(room).emit('updatedMessage', result);
  }

  @SubscribeMessage('sendMessage')
  async message(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: Room['id']; content: string },
  ) {
    try {
      const { roomId, content } = data;
      const senderId = client.data.user.id;
      const sender = await this.participantService.findByRoomUser(+roomId, +senderId);
      if (!sender) {
        throw new WsException('해당 채팅방의 초대자가 아닙니다.');
      }

      const { room, readers } = await this.createNotReaders(sender.id, +roomId);
      const type = MessageType.Text;
      const message = await this.messageService.create({
        sender,
        type,
        content,
        room,
        notRead: readers,
      });
      console.log('create message successfully: ', message);

      const foundSender = await this.findNickname(senderId);
      const koreaTime = await this.toKoreaTime(message.timestamp);
      const sendMessage = {
        id: message.id,
        sender: foundSender,
        senderId: sender.id,
        type: message.type,
        content: message.content,
        timestamp: koreaTime,
        notRead: message.notRead,
      };
      await this.sendMessage(room.name, sendMessage);

      for (const reader of message.notRead) {
        const participant = await this.participantService.findOneByIdWithUser(reader);
        const notice = await this.createNotice({
          receiver: participant.user,
          message: message,
          read: false,
        });
        const clientId = await this.getUserIdSocket(participant.user.id);
        if (!clientId) {
          // socket 이 연결되어 있을 경우에만 알람 전송
          continue;
        }
        const findNotice = await this.findNotice(notice.id);
        const sendNotice = {
          id: findNotice.id,
          room: findNotice.message.room.id,
          sender: findNotice.message.sender.user.nickname,
          content: findNotice.message.content,
          timestamp: findNotice.message.timestamp,
          read: findNotice.read,
        };
        await this.sendNotice(clientId, sendNotice);
      }
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('getNotReadNotice')
  async getNotReadNotice(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;
    const notices = await this.notificationService.findManyNotRead(userId);
    const data = await Promise.all(
      notices.map(async ({ id, read, message }) => {
        const sender = message.sender.user.nickname;
        return {
          id,
          sender,
          read,
          content: message.content,
          room: message.room.id,
          timestamp: message.timestamp,
        };
      }),
    );
    client.emit('isNotRead', data);
  }

  @SubscribeMessage('readNotice') // 읽은 알림 처리하기
  async isRead(@ConnectedSocket() client: Socket, @MessageBody() data: { noticeId: number }) {
    const user = client.data.user;
    await this.notificationService.update(data.noticeId);
  }
}
