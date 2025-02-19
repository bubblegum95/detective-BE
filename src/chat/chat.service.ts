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
import { MessageType } from './type/message.type';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    @InjectRepository(Participant) private readonly participantRepository: Repository<Participant>,
    private readonly dataSource: DataSource,
    private readonly userService: UserService,
  ) {}

  async findUserById(userId: number) {
    return await this.userService.findOneById(userId);
  }

  async findParticipant(roomId: number, userId: number): Promise<Participant> {
    return await this.participantRepository.findOne({
      where: { room: { id: roomId }, user: { id: userId } },
    });
  }

  async findParticipantById(participantId: number) {
    return await this.participantRepository.findOne({
      where: { id: participantId },
      relations: ['user'],
    });
  }

  async saveRoom(name: string): Promise<Room> {
    return await this.roomRepository.save({ name });
  }

  async findRoomById(roomId: number): Promise<Room> {
    return await this.roomRepository.findOne({
      where: { id: roomId },
      relations: ['participants'],
    });
  }

  async createParticipant(room: Room, user: User): Promise<Participant> {
    return await this.participantRepository.save({
      room,
      user,
    });
  }

  async findRoomsUserExisting(userId: number) {
    return await this.dataSource
      .getRepository(Room)
      .createQueryBuilder('room')
      .select(['room.name'])
      .leftJoin('room.participants', 'participants')
      .where('participants.userId = :userId', { userId })
      .getMany();
  }

  async createRoom(client: Socket, recipientId: number) {
    try {
      const user = client.data.user;
      const recipient = await this.findUserById(recipientId);
      if (!recipient) {
        throw new WsException('사용자가 존재하지 않습니다.');
      }

      const foundRoom = await this.findExistRoom(user.id, recipientId);
      if (!foundRoom) {
        const name = uuidv4();
        const room = await this.saveRoom(name);

        await this.createParticipant(room, user);
        await this.createParticipant(room, recipient);

        return room;
      } else {
        return foundRoom;
      }
    } catch (error) {
      throw error;
    }
  }

  async findRoomsUserBelongsTo(userId: number): Promise<Room[]> {
    try {
      const rooms: Room[] = await this.findRoomsUserExisting(userId);
      rooms.map((room) => {
        room.name;
      });

      return rooms;
    } catch (error) {
      throw error;
    }
  }

  async joinRoom(client: Socket): Promise<Array<Room['name']>> {
    const user = client.data.user;
    const rooms = await this.findRoomsUserBelongsTo(user.id);
    return rooms.map(({ id, name, createdAt, participants }) => name);
  }

  async findMessages(roomId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await this.messageModel
      .find({ id: roomId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findRoomMessages(roomId: number, page: number, limit: number) {
    try {
      const messages = await this.findMessages(roomId, page, limit);
      messages.map(async ({ type, content, sender, room, read, timestamp }) => {
        const participant = await this.findParticipantById(sender);
        const nickname = participant.user.nickname;
        return {
          type,
          content,
          sender: nickname,
          room,
          read: read.length,
          timestamp,
        };
      });

      return messages;
    } catch (error) {
      throw error;
    }
  }

  async createChat(meta: {
    sender: number;
    type: MessageType;
    content: string | string[];
    room: string;
    read: number[];
  }) {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    return await this.messageModel.create({
      ...meta,
      timestamp,
    });
  }

  async saveMassage(user: User, roomId: number, content: string | string[]) {
    try {
      const userId = user.id;
      const userParticipant = await this.findParticipant(roomId, userId);
      const room = await this.findRoomById(roomId);
      const participants = room.participants.map(({ id, createdAt, room, user }) => id);
      const readers = participants.filter((participant) => participant !== userParticipant.id);
      const message = await this.createChat({
        sender: userParticipant.id,
        type: MessageType.Text,
        content: content,
        room: room.name,
        read: readers,
      });
      const nickname = await this.userService.findUserNameById(userId);

      return {
        sender: nickname,
        type: message.type,
        content: message.content,
        timestamp: message.timestamp,
        room: message.room,
        read: message.read.length,
      };
    } catch (error) {
      throw error;
    }
  }

  async findRoom(userId: number, recipientId: number) {
    return await this.participantRepository
      .createQueryBuilder('p1')
      .innerJoin('participant', 'p2', 'p1.roomId = p2.roomId')
      .where('p1.userId = :userId', { userId })
      .andWhere('p2.userId = :recipientId', { recipientId })
      .select('p1.roomId')
      .getOne();
  }

  async findExistRoom(userId: number, recipientId: number): Promise<Room | null> {
    try {
      const room = await this.findRoom(userId, recipientId);
      if (room) {
        const foundRoom = await this.roomRepository.findOne({
          where: { id: room.id },
          select: { name: true },
        });

        return foundRoom;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  async handleNotification(data: { type: string; message: string; senderId: number }) {
    console.log('알림:', data);
  }

  acceptRegistration(senderId: number) {
    console.log(`등록 수락: ${senderId}`);
  }

  // async getRooms(userId: number) {
  //   return await this.dataSource
  //     .getRepository(Room)
  //     .createQueryBuilder('room')
  //     .leftJoinAndSelect('room.participants', 'participant')
  //     .leftJoinAndSelect('participant.user', 'user')
  //     .where((qb) => {
  //       const subQuery = qb
  //         .subQuery()
  //         .select('p.roomId')
  //         .from(Participant, 'p')
  //         .where('p.userId = :userId')
  //         .getQuery();
  //       return 'room.id IN ' + subQuery;
  //     })
  //     .setParameter('userId', userId)
  //     .getMany();
  // }

  // async getAllChatRooms(user: User) {
  //   const userId = user.id;
  //   try {
  //     const rooms = await this.getRooms(userId);
  //     const roomLists = [];
  //     const participantLists = [];

  //     rooms.map((room) => {
  //       room.participants.map((participant) => {
  //         participantLists.push(participant.user.nickname);
  //       });

  //       const roomlist = {
  //         id: room.id.toString(),
  //         name: room.name,
  //         createdAt: room.createdAt,
  //         participants: participantLists,
  //       };
  //       roomLists.push(roomlist);
  //     });

  //     return roomLists;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  async findMessageReceiver(id: number) {
    return await this.roomRepository.findOne({
      where: { id },
      relations: ['participants', 'participants.user'],
    });
  }
}
