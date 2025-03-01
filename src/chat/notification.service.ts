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
    return await this.notificationModel
      .find({ receiver, isRead: false })
      .sort({ timestamp: -1 })
      .limit(30)
      .exec();
  }

  async create(dto: CreateNotificationDto) {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    return await this.notificationModel.create({
      ...dto,
      timestamp,
    });
  }

  async createAndReturn(dto: CreateNotificationDto) {
    const notification = await this.create(dto);
    return {
      id: notification._id,
      receiver: notification.receiver,
      sender: notification.sender,
      room: notification.room,
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
