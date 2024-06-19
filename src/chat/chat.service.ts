import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(@InjectModel(Message.name) private readonly messageModel: Model<Message>) {}

  async createMessage(content: string, sender: string, receiver: string): Promise<Message> {
    const newMessage = new this.messageModel({ content, sender, receiver });
    return newMessage.save();
  }

  async findAll(): Promise<Message[]> {
    return this.messageModel.find().exec();
  }
}
