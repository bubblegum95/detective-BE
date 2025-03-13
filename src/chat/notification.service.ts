import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import moment from 'moment';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification')
    private readonly notificationModel: Model<Notification>,
  ) {}

  async findManyNotRead(receiver: User['id']) {
    const notifications = await this.notificationModel
      .find({ receiver, isRead: false })
      .sort({ timestamp: -1 })
      .limit(30)
      .exec();
    return notifications.map(({ _id, receiver, sender, room, content, isRead, timestamp }) => {
      return { id: _id, receiver, sender, room, content, isRead, timestamp };
    });
  }

  async create(dto: CreateNotificationDto) {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const notification = await this.notificationModel.create({
      ...dto,
      timestamp,
    });
    return {
      id: notification._id,
      receiver: notification.receiver,
      sender: notification.sender,
      room: notification.room,
      content: notification.content,
      isRead: notification.isRead,
      timestamp: notification.timestamp,
    };
  }

  async isRead(id: Notification['_id']) {
    await this.notificationModel.findByIdAndUpdate(id, {
      isRead: true,
    });
  }
}
