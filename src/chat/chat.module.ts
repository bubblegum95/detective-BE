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
import { ChatService } from './chat.service';
import { RedisModule } from 'src/redis/redis.module';
import { RedisController } from 'src/redis/redis.controller';
import { S3Module } from '../s3/s3.module';
import { Participant } from '../user/entities/participant.entity';
import { ChatController } from './chat.controller';
import { S3Service } from '../s3/s3.service';
import { File } from '../s3/entities/s3.entity';

@Module({
  imports: [
    UserModule,
    S3Module,
    RedisModule,
    JwtModule,
    UserModule,
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    TypeOrmModule.forFeature([User, Room, Participant, File]),
  ],
  controllers: [RedisController, ChatController],
  providers: [ChatGateway, ChatService, JwtService, UserService, S3Service],
  exports: [ChatGateway],
})
export class ChatModule {}
