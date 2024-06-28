import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebSocketClientService } from './chat-client.service';
import { Message, MessageSchema } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Room } from './entities/room.entity';

@Module({
  imports: [
    JwtModule, 
    MongooseModule.
    forFeature([{ name: Message.name, schema: MessageSchema }]),
    TypeOrmModule.forFeature([User, Room]),
  ],
  providers: [WebSocketClientService, ChatGateway, JwtService],
  exports: [WebSocketClientService, ChatGateway],
})
export class ChatModule {}
