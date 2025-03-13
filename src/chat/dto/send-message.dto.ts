import { User } from '../../user/entities/user.entity';
import { Message } from '../entities/message.entity';
import { MessageType } from '../type/message.type';

export class SendMessageDto {
  id: Message['_id'];
  sender: User['nickname'];
  type: MessageType;
  content: Message['content'];
  timestamp: Message['timestamp'];
  read: number; // 읽지 않은 사람 수
}
