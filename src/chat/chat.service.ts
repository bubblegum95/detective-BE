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
import moment from 'moment';
import { WsException } from '@nestjs/websockets';
import { Participant } from '../user/entities/participant.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(Participant) private readonly participantRepository: Repository<Participant>,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}
  private readonly logger = new Logger(ChatService.name);

  async createRoom(client: Socket, user: User, recipientId: number): Promise<string | string[]> {
    try {
      const foundUser = await this.userService.findUserbyId(user.id);
      const recipient = await this.userService.findUserbyId(recipientId);

      if (!foundUser || !recipient) {
        throw new WsException('사용자가 존재하지 않습니다.');
      }
      console.log('<------------hear------------->');
      const foundRoom = await this.findExistRoom(user.id, recipientId);
      console.log('found Room: ', foundRoom);

      let roomName: string;

      if (!foundRoom) {
        const name = uuidv4();
        this.logger.log(`name: ${name}`);

        const room = await this.roomRepository.save({ name });
        console.log('creat room: ', room);

        await this.createParticipant(room.id, user.id);
        await this.createParticipant(room.id, recipientId);

        roomName = room.name;
      } else if (foundRoom) {
        this.logger.log(`found room : ${foundRoom}`);
        roomName = foundRoom;
      }

      if (!roomName) {
        throw new WsException('룸을 생성할 수 없습니다.');
      }

      return roomName;
    } catch (error) {
      throw error;
    }
  }

  async createParticipant(roomId: number, userId: number) {
    try {
      console.log('room and user: ', roomId, userId);
      if (!roomId || !userId) {
        throw new WsException('룸 또는 사용자가 없습니다.');
      }

      const participant = await this.participantRepository.save({
        roomId,
        userId,
      });

      if (!participant) {
        throw new WsException('해당 룸에 사용자를 추가할 수 없습니다.');
      }

      return participant;
    } catch (error) {
      throw error;
    }
  }

  async joinRoom(client: Socket, user: User): Promise<string | string[] | null> {
    try {
      const userId = user.id;
      const foundRooms: string[] | null = await this.findRoomsUserBelongsTo(userId);

      return foundRooms;
    } catch (error) {
      throw error;
    }
  }

  async findRoomMessages(roomName: string, roomId: number, user: User): Promise<object[]> {
    try {
      const userId = user.id;

      if (!roomName || !roomId || !user) {
        console.log(roomName, roomId, user);
        throw new WsException('해당 룸 정보가 없습니다.');
      }

      const room = await this.existClientInRoom(roomId, userId);

      if (!room) {
        throw new WsException('User is not in this room');
      }

      const messages: Message[] = await this.messageModel
        .find({ room: roomName })
        .sort({ timestamp: -1 })
        .limit(50)
        .exec();

      if (!messages) {
        throw new WsException('메시지가 없습니다.');
      }

      const newList = [];

      for (let i = 0; i < messages.length; i++) {
        const user: string = await this.userService.findUserNameById(messages[i].sender);

        const reUndefinedMessage = {
          sender: user,
          content: messages[i].content,
          timestamp: messages[i].timestamp,
        };

        newList.push(reUndefinedMessage);
      }

      console.log('newList', newList);
      this.logger.log('get all messages in this room');

      return newList;
    } catch (error) {
      throw error;
    }
  }

  async saveMassage(user: User, roomId: number, roomName: string, message: string) {
    try {
      const userId = user.id;
      const room = await this.existClientInRoom(roomId, userId);

      if (!room) {
        this.logger.log('User is not in this room');
        return;
      }

      const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

      const messageInfo = await this.messageModel.create({
        sender: userId,
        content: message,
        room: roomName,
        timestamp: timestamp,
      });

      if (!messageInfo) {
        throw new WsException('메시지 생성에 실패했습니다.');
      }

      const foundUserNickname = await this.userService.findUserNameById(userId);

      if (!foundUserNickname) {
        throw new WsException('해당 사용자의 정보를 가져올 수 없습니다.');
      }

      return {
        sender: foundUserNickname,
        content: messageInfo.content,
        timestamp: messageInfo.timestamp,
        room: roomName,
      };
    } catch (error) {
      throw error;
    }
  }

  async existClientInRoom(roomId: number, userId: number) {
    try {
      const result = await this.participantRepository.findOne({ where: { roomId, userId } });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async findRoomsUserBelongsTo(userId: number): Promise<string[] | null> {
    try {
      const foundRooms = await this.dataSource
        .getRepository(Room)
        .createQueryBuilder('room')
        .select(['room.name'])
        .leftJoin('room.participants', 'participants')
        .where('participants.userId = :userId', { userId })
        .getMany();

      console.log('found rooms: ', foundRooms);
      let roomArr = [];

      foundRooms.filter((room) => {
        const rooms = room.name;
        roomArr.push(rooms);
      });
      console.log('room array: ', roomArr);

      return roomArr;
    } catch (error) {
      throw error;
    }
  }

  async findExistRoom(userId: number, recipientId: number): Promise<string | null> {
    try {
      const room = await this.participantRepository
        .createQueryBuilder('p1')
        .innerJoin('participant', 'p2', 'p1.roomId = p2.roomId')
        .where('p1.userId = :userId', { userId })
        .andWhere('p2.userId = :recipientId', { recipientId })
        .select('p1.roomId')
        .getOne();

      if (room) {
        const foundRoom = await this.roomRepository.findOne({
          where: { id: room.id },
          select: { name: true },
        });

        console.log('found room name: ', foundRoom.name);
        return foundRoom.name;
      } else if (!room) {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }
}
