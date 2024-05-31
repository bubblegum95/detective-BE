import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { RedisModule } from '../redis/redis.module';

@Module({
  providers: [ChatGateway, ChatService, RedisModule],
  imports: [
    TypeOrmModule.forFeature([Chat]),
    MongooseModule.forFeature([{ name: 'Message', schema: Message }]),
  ],
})
export class ChatModule {}
