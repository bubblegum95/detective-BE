import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Room } from './entities/room.entity';
import { UserModule } from 'src/user/user.module';
import { RoomService } from './room.service';
import { RedisModule } from 'src/redis/redis.module';
import { S3Module } from '../s3/s3.module';
import { ChatController } from './chat.controller';
import { File } from '../s3/entities/s3.entity';
import { NotificationService } from './notification.service';
import { ParticipantService } from './participant.service';
import { Participant } from './entities/participant.entity';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { Notice } from './entities/notice.entity';

@Module({
  controllers: [ChatController],
  providers: [ChatGateway, MessageService, RoomService, NotificationService, ParticipantService],
  exports: [RoomService, MessageService, NotificationService, ParticipantService, ChatGateway],
  imports: [
    UserModule,
    S3Module,
    RedisModule,
    JwtModule,
    UserModule,
    TypeOrmModule.forFeature([User, Room, Participant, Message, Notice, File]),
  ],
})
export class ChatModule {}
