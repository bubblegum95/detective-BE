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
import { UserService } from 'src/user/user.service';
import { v4 as uuidv4} from 'uuid';

@UseGuards(JwtAuthGuard)
@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}

  @SubscribeMessage('createRoom')
  async handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() recipientId: number,
    @UserInfo() user: User,
  ) {
    let roomName: string;
    user = await this.userService.findUserbyId(user.id)
    const recipient = await this.userService.findUserbyId(recipientId)
    const foundRoom = await this.findExistRoom(user.id, recipientId)

    if(!foundRoom) {
      console.log('didnt find room')
      const name = uuidv4(); 
      console.log('name: ', name)
      const room = await this.roomRepository.save({name}); // Room 생성
      room.user = [user, recipient]; // 관계 설정 추가 
      const createdRoom = await this.roomRepository.save(room); // 설정 추가 후 저장
      roomName = room.name;

    } else if (foundRoom) {
      console.log('found room')
      const roomName = foundRoom;
    }

    client.join(roomName);
    client.emit('createdRoom', roomName);
  }

  @SubscribeMessage('joinRooms')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket, 
    @UserInfo() user: User
  ) {
    const userId = user.id
    const foundRooms: string[] | null = await this.findRoomsUserBelongsTo(userId)
    client.join(foundRooms)
    const roomlist = this.server.sockets.adapter.rooms; // socket.io room
    console.log('roomlist: ', roomlist)
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; message: string },
    @UserInfo() user: User,
  ) {
    const room = data.room
    const userId = user.id
    const existInRoom = await this.existClientInRoom(userId, room)
    
    if(!existInRoom) {
      console.log({message: 'User isnt in this room'})
      return;
    }

    const messageInfo = await this.messageModel.create({sender: userId, content: data.message, room: data.room})
    const foundUserNickname = await this.userService.findUserNameById(userId)
    const returnData = {sender: foundUserNickname, content: messageInfo.content, time: messageInfo.timestamp}
    this.server.to(room).emit('getMessage', returnData);
  }

  async existClientInRoom(userId: number, roomName: string): Promise<Room | undefined> {
    const foundRoom = await this.dataSource.getRepository(Room)
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.user', 'user')
      .where('room.name = :roomName', { roomName })
      .andWhere('user.id = :userId', { userId })
      .getOne();
    
    console.log('found room: ', foundRoom)
    return foundRoom;
  }  

  async findRoomsUserBelongsTo(userId: number):Promise<string[] | null> {
    const foundRooms = await this.dataSource.getRepository(Room)
      .createQueryBuilder('room')
      .leftJoin('room.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();

    let roomArr = [];

    foundRooms.filter(room => {
      const rooms = room.name; 
      roomArr.push(rooms);
    })
    
    return roomArr;
  }

  async findExistRoom (userId: number, recipientId: number): Promise<string | null> {
    const room = await this.roomRepository.createQueryBuilder('room')
    .innerJoin('room.user', 'user1', 'user1.id = :userId', { userId })
    .innerJoin('room.user', 'user2', 'user2.id = :recipientId', { recipientId })
    .getOne();

    console.log('room: ', room);
    if (room) {return room.name}
    else if (!room) {return null}
  }
}
