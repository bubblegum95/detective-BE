import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataSource } from 'typeorm';
import moment from 'moment';
import { Notification } from './entities/notification.entity';
import { ChatService } from '../chat/chat.service';
import { Participant } from '../user/entities/participant.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
    private readonly chatService: ChatService,
  ) {}
  // 메시지 수신자 찾기 -> participants에서 room id를 모두 긁어오기? 아님 room 에서 paricipants를 relation으로 가져오기. 거기서 유저를 추출하면 됨
  async findMessageReceiver(roomId: number) {
    const room = await this.chatService.findMessageReceiver(roomId);
    const receivers: Participant[] = room.participants;
    const users = receivers.map((receiver) => receiver.user).filter((user) => user !== undefined);
    return users;
  }

  async getNotReadNotification(receiver: number) {
    const isNotRead = await this.notificationModel
      .find({ receiver: receiver, read: false }) // 조건 설정
      .sort({ timestamp: -1 })
      .limit(30)
      .exec();

    return isNotRead;
  }

  async saveNotification(data: any) {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');

    const savedData: Notification = await this.notificationModel.create({
      type: data.type,
      receiver: data.receiver,
      sender: data.sender,
      content: data.content,
      timestamp: timestamp,
      read: false,
    });

    const dataWithId = {
      id: savedData._id.toString(),
      type: data.type,
      receiver: data.receiver,
      sender: data.sender,
      content: data.content,
      timestamp: timestamp,
      read: false,
    };

    console.log('data with id:', dataWithId);

    return dataWithId;
  }

  isReadNotification(id: string) {
    this.notificationModel.findByIdAndUpdate({
      _id: id,
      read: true,
    });
  }
}
