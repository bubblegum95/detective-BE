import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './entities/message.entity';
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
import { Notification, NotificationSchema } from './entities/notification.entity';
import { ParticipantService } from './participant.service';
import { Participant } from './entities/participant.entity';
import { MessageService } from './message.service';

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
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    TypeOrmModule.forFeature([User, Room, Participant, File]),
  ],
})
export class ChatModule {}
