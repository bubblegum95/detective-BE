import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './entities/message.entity';
import { MessageBodyDto } from './dto/message-body.dto';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Message.name) private readonly messageModel: Model<Message>) {}

  async createMessage(data: MessageBodyDto): Promise<Message> {
    const { content, sender, receiver, senderId, receiverId } = data;
    const newMessage = new this.messageModel({ content, sender, receiver, senderId, receiverId });
    return newMessage.save();
  }

  async findAll(): Promise<Message[]> {
    return this.messageModel.find().exec();
  }
}
