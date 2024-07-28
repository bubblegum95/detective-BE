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
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RedisController } from 'src/redis/redis.controller';
import { S3Module } from '../s3/s3.module';
import { ChatFile, ChatFileSchema } from './entities/chat-file.entity';
import { Participant } from '../user/entities/participant.entity';

@Module({
  imports: [
    S3Module,
    RedisModule,
    JwtModule,
    UserModule,
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: ChatFile.name, schema: ChatFileSchema },
    ]),
    TypeOrmModule.forFeature([User, Room, Participant]),
    ClientsModule.register([
      {
        name: 'REDIS_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        },
      },
    ]),
  ],
  controllers: [RedisController],
  providers: [ChatGateway, ChatService, JwtService, UserService],
  exports: [ChatGateway],
})
export class ChatModule {}
