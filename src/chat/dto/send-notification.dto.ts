import { PartialType } from '@nestjs/swagger';
import { Notification } from '../entities/notification.entity';

export class SendNotificationDto extends PartialType(Notification) {
  id: Notification['_id'];
  room: Notification['room'];
  content: Notification['content']; // 알림 내용
  timestamp: Notification['timestamp'];
  isRead: Notification['isRead'];
}
