import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Message } from './entities/message.entity';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/entities/user.entity';
import moment from 'moment';
import { MessageType } from './type/message.type';
import { Room } from './entities/room.entity';

@Injectable()
export class MessageService {
  constructor(@InjectModel('Message') private readonly messageModel: Model<Message>) {}

  async findMany(room: Room['id'], page: number, limit: number) {
    const skip = (page - 1) * limit;
    return await this.messageModel
      .find({ room })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async findLast(room: Room['id']) {
    return await this.messageModel.findOne({ room }).sort({ timestamp: -1 }).exec();
  }

  async create(dto: {
    sender: User['id'];
    type: MessageType;
    content: string | string[];
    room: Room['id'];
    read: Array<User['id']>;
  }) {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    return await this.messageModel.create({
      ...dto,
      timestamp,
    });
  }

  async updateRead(id: Message['_id'], userId: User['id']) {
    return await this.messageModel.findByIdAndUpdate(id, { $pull: { read: userId } });
  }
}
