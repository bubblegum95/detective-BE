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
import { ChatService } from './chat.service';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessageDto } from './dto/message.dto';

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
    private readonly chatService: ChatService,
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

  handleConnection(client: Socket) {
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
      client.data.user = payload;
      console.log('✅ socket clients connected');
    } catch (error) {
      console.error(error.message);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('✅ socket clients disconnected');
  }

  @SubscribeMessage('ping')
  ping(@ConnectedSocket() client: Socket, @MessageBody() hello: string) {
    console.log('client socket:', client, 'hello', hello);
  }
  // 초대하기
  @SubscribeMessage('createRoom')
  async createRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { recipientId: number },
  ) {
    try {
      const room = await this.chatService.createRoom(client, data.recipientId);
      if (!room) {
        throw new WsException('방 생성 및 사용자 초대를 할 수 없습니다.');
      }
      client.join(room.name);
      client.emit('createdRoom', room);
    } catch (error) {
      client.emit('error', error.message);
    }
  }
  // 소켓 조인
  @SubscribeMessage('joinRoom')
  async joinRoom(@ConnectedSocket() client: Socket) {
    try {
      const rooms = await this.chatService.joinRoom(client);
      client.join(rooms);

      const roomlist = this.server.sockets.adapter.rooms; // socket.io room
      console.log('roomlist: ', roomlist);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('sendMessage')
  async message(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number; content: string },
  ) {
    try {
      const user = client.data.user;
      const { roomId, content } = data;
      const message = await this.chatService.saveMassage(user, roomId, content);

      this.redisClient.emit('message_to_redis', message);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('getMessages')
  async getMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: number; page: number; limit: number },
  ): Promise<void> {
    try {
      const { roomId, page, limit } = data;
      const messages = await this.chatService.findRoomMessages(roomId, page, limit);
      client.emit('messages', messages);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @EventPattern('message_to_redis')
  async subscribe(data: MessageDto) {
    console.log('data', data);
    this.server.to(data.room).emit('message', data);
  }
}
