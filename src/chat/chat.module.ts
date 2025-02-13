import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Room } from './entities/room.entity';
import { UserModule } from 'src/user/user.module';
import { ChatService } from './chat.service';
import { RedisModule } from 'src/redis/redis.module';
import { S3Module } from '../s3/s3.module';
import { Participant } from '../user/entities/participant.entity';
import { ChatController } from './chat.controller';
import { File } from '../s3/entities/s3.entity';

@Module({
  controllers: [ChatController],
  providers: [ChatGateway, ChatService],
  imports: [
    UserModule,
    S3Module,
    RedisModule,
    JwtModule,
    UserModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    TypeOrmModule.forFeature([User, Room, Participant, File]),
  ],
  exports: [ChatService],
})
export class ChatModule {}
