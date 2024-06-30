import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Room } from './entities/room.entity';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';

@Module({
  imports: [
    JwtModule, 
    UserModule,
    MongooseModule.
    forFeature([{ name: Message.name, schema: MessageSchema }]),
    TypeOrmModule.forFeature([User, Room]),
  ],
  providers: [ChatGateway, JwtService, UserService],
  exports: [ChatGateway],
})
export class ChatModule {}
