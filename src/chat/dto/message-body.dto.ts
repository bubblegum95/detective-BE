import { User } from '../../user/entities/user.entity';
import { Room } from '../entities/room.entity';
import { MessageType } from '../type/message.type';

export class CreateMessageDto {
  sender: User['id'];
  type: MessageType;
  content: string | string[];
  room: Room['id'];
  read: Array<User['id']>;
}
