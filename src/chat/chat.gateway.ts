import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserInfo } from '../utils/user-info.decorator';
import { User } from '../user/entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    data: { message: string; email: string },
    @UserInfo() user: User,
  ) {
    const room = await this.roomRepository.save({});
    const roomId = room.id.toString();
    const recipient = await this.dataSource.getRepository(User)
    .findOne({where: {email: data.email}, select: {id: true}})

    room.user.push(user, recipient);
    await this.roomRepository.save(room)
    console.log('room: ', room)

    client.join(roomId);
    client.emit('create roomm and join', roomId);

    console.log(`Room ${roomId} created.`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, room: string, @UserInfo() user: User) {
    const roomId = Number(room);
    const userId = user.id
    const existUserInRoom = this.existClientInRoom(userId, roomId)

    if(!existUserInRoom){
      console.error('user is not exist in room');
      client.emit('user is not exist in room')
    }

    client.join(room)
    console.log(`User ${client.id} joined room ${roomId}.`);
  }

  async existClientInRoom(user: number, room: number) {
    const foundRoom = await this.dataSource.getRepository(User)
    .createQueryBuilder('roomList')
    .leftJoin('room.user', 'user')
    .where('room.id = roomId', {room})
    .andWhere('user.id = :userId', {user})
    .getOne()

    return foundRoom
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { room: string; message: string },
    @ConnectedSocket() client: Socket,
    @UserInfo() user: User,
    server: Server,
  ) {
    console.log('data: ', data);
    const room = data.room
    const roomId = Number(data.room)
    const userId = user.id

    const existInRoom = await this.existClientInRoom(userId, roomId)
    if(!existInRoom) {
      console.error('User isnt in this room')
    }

    this.messageModel.create({sender: user.id, content: data.message, room: data.room})
    this.server.to(data.room).emit('message', data.message);
  }
}
