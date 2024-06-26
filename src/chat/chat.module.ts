import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebSocketClientService } from './chat-client.service';
import { Message, MessageSchema } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [JwtModule, MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])],
  providers: [WebSocketClientService, ChatGateway, JwtService],
  exports: [WebSocketClientService, ChatGateway],
})
export class ChatModule {}
