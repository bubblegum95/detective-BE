import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { Notification, NotificationSchema } from './entities/notification.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Participant } from '../user/entities/participant.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    TypeOrmModule.forFeature([Participant]),
  ],
  providers: [NotificationGateway, NotificationService],
})
export class NotificationModule {}
