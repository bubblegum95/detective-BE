import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { Notification, NotificationSchema } from './entities/notification.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    ChatModule,
  ],
  providers: [NotificationGateway, NotificationService],
})
export class NotificationModule {}
