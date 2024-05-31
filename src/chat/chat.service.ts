import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from './entities/message.entity';
import { Model } from 'mongoose';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
  ) {}

  async saveMessage(content: string, sender: string, receiver: string): Promise<void> {
    // MongoDB에 메시지 내용 저장
    const message = new this.messageModel({ content, sender, receiver });
    await message.save();

    await this.chatRepository.save();
  }

  async getMessages(sender: string, receiver: string): Promise<Message[]> {
    return this.messageModel.find({ sender, receiver }).exec();
  }
}
