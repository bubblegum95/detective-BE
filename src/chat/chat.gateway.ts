import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { OnModuleInit, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserInfo } from '../utils/user-info.decorator';
import { User } from '../user/entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, getConnection } from 'typeorm';
import { Room } from './entities/room.entity';

@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    private readonly dataSource: DataSource,
  ) {}

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    client: Socket,
    data: { message: string; url: string },
    @UserInfo() user: User,
  ) {
    const room = await this.roomRepository.save({});
    const roomId = room.id.toString();

    room.user.push(user, recipient);
    await this.roomRepository.save(room);

    client.join(roomId);
    client.emit('create roomm and join', roomId);

    console.log(`Room ${roomId} created.`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, roomId: string): void {
    const room = Number(roomId);
    const existUserInRoom = client.join(roomId);
    console.log(`User ${client.id} joined room ${roomId}.`);
  }

  async existClientFromRooms(clientId: string, roomId: string): void {
    const foundRoom = await this.roomRepository.update({ where: { roomId } });
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: { room: string; message: string },
    @ConnectedSocket() client: Socket,
    @UserInfo() user: User,
    server: Server,
  ): void {
    console.log('data: ', data);
    console.group('user: ', client);
    this.server.to(data.room).emit('message', data.message);
  }
}
