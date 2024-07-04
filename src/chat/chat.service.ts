import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Socket } from 'socket.io';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { DataSource, Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { Room } from './entities/room.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}
  private readonly logger = new Logger(ChatService.name);

  async createRoom(client: Socket, user: User, recipientId: number): Promise<string | string[]> {
    let roomName: string;
    user = await this.userService.findUserbyId(user.id);
    const recipient = await this.userService.findUserbyId(recipientId);
    const foundRoom = await this.findExistRoom(user.id, recipientId);

    if (!foundRoom) {
      this.logger.log('didnt find room');

      const name = uuidv4();
      this.logger.log(`name: ${name}`);

      const room = await this.roomRepository.save({ name }); // Room 생성
      room.user = [user, recipient]; // 관계 설정 추가

      await this.roomRepository.save(room); // 설정 추가 후 저장
      roomName = room.name;
    } else if (foundRoom) {
      this.logger.log(`found room : ${foundRoom}`);

      roomName = foundRoom;
    }

    return roomName;
  }

  async joinRoom(client: Socket, user: User): Promise<string | string[] | null> {
    const userId = user.id;
    const foundRooms: string[] | null = await this.findRoomsUserBelongsTo(userId);
    console.log();
    return foundRooms;
  }

  async findRoomMessages(client: Socket, roomId: string, user: User): Promise<object[]> {
    const userId = user.id;
    const existInRoom = await this.existClientInRoom(userId, roomId);
    try {
      if (!existInRoom) {
        this.logger.log('User is not in this room');
        throw new Error('User is not in this room');
      } else {
        this.logger.log('get all messages in this room');
        let messages: Message[] = await this.messageModel
          .find({ room: roomId })
          .sort({ timestamp: -1 })
          .limit(50)
          .exec();

        const foundUserNickname: string = await this.userService.findUserNameById(userId);

        const chanegUserName: object[] = messages.map((message) => {
          const chaneMessage = {
            sender: foundUserNickname,
            content: message.content,
            timestamp: message.timestamp,
          };

          return chaneMessage;
        });

        return chanegUserName;
      }
    } catch (error) {
      throw error;
    }
  }

  async saveMassage(client: Socket, data: { room: string; message: string }, user: User) {
    const room = data.room;
    const userId = user.id;
    const existInRoom = await this.existClientInRoom(userId, room);

    if (!existInRoom) {
      this.logger.log('User is not in this room');
      return;
    }

    const messageInfo = await this.messageModel.create({
      sender: userId,
      content: data.message,
      room: data.room,
    });

    const foundUserNickname = await this.userService.findUserNameById(userId);

    return {
      sender: foundUserNickname,
      content: messageInfo.content,
      timestamp: messageInfo.timestamp,
      room: room,
    };
  }

  async existClientInRoom(userId: number, roomName: string): Promise<Room | undefined> {
    const foundRoom = await this.dataSource
      .getRepository(Room)
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.user', 'user')
      .where('room.name = :roomName', { roomName })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    console.log('found room: ', foundRoom);
    return foundRoom;
  }

  async findRoomsUserBelongsTo(userId: number): Promise<string[] | null> {
    const foundRooms = await this.dataSource
      .getRepository(Room)
      .createQueryBuilder('room')
      .leftJoin('room.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();

    let roomArr = [];

    foundRooms.filter((room) => {
      const rooms = room.name;
      roomArr.push(rooms);
    });

    return roomArr;
  }

  async findExistRoom(userId: number, recipientId: number): Promise<string | null> {
    const room = await this.roomRepository
      .createQueryBuilder('room')
      .innerJoin('room.user', 'user1', 'user1.id = :userId', { userId })
      .innerJoin('room.user', 'user2', 'user2.id = :recipientId', { recipientId })
      .getOne();

    console.log('room: ', room);
    if (room) {
      return room.name;
    } else if (!room) {
      return null;
    }
  }
}
