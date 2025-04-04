import { PartialType } from '@nestjs/swagger';
import { Notice } from '../entities/notice.entity';
import { Room } from '../entities/room.entity';
import { Message } from '../entities/message.entity';
import { User } from '../../user/entities/user.entity';

export class SendNotificationDto extends PartialType(Notification) {
  id: Notice['id'];
  room: Room['id'];
  sender: User['nickname'];
  content: Message['content']; // 알림 내용
  timestamp: Message['timestamp'];
  read: Notice['read'];
}
