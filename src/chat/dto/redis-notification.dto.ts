import { Notification } from '../entities/notification.entity';
import { Room } from '../entities/room.entity';

export class RedisNotificationDto {
  id: Notification['_id'];
  room: Room['id'];
  content: string; // 알림 내용
  timestamp: string;
}
