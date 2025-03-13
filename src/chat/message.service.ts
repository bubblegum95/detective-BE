import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Message } from './entities/message.entity';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../user/entities/user.entity';
import moment from 'moment';
import { MessageType } from './type/message.type';
import { Room } from './entities/room.entity';
import { CreateMessageDto } from './dto/message-body.dto';

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

  async create(dto: CreateMessageDto) {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    const message = await this.messageModel.create({
      ...dto,
      timestamp,
    });
    return {
      id: message._id,
      sender: message.sender,
      type: message.type,
      content: message.content,
      room: message.room,
      read: message.read,
      timestamp: message.timestamp,
    };
  }

  async updateRead(id: Message['_id'], userId: User['id']) {
    return await this.messageModel.findByIdAndUpdate(id, { $pull: { read: userId } });
  }
}
