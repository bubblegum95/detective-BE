import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DataSource } from 'typeorm';
import { Room } from '../chat/entities/room.entity';
import moment from 'moment';
import { Notification } from './entities/notification.entity';
import { Participant } from '../user/entities/participant.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
    private readonly dataSource: DataSource,
  ) {}

  async findMessageReceiver(roomId: number, userId: number): Promise<number[]> {
    const participants: Participant[] = await this.dataSource
      .getRepository(Participant)
      .find({ where: { roomId }, select: { userId: true } });

    console.log('participants list: ', participants);
    // const receiver = participants.userId
    // const memberList: number[] = [];

    // for (const member of members) {
    //   memberList.push(Number(member.id));
    // }
    // console.log('member list:', memberList);

    return;
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
