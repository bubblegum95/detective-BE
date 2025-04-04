import { Participant } from '../entities/participant.entity';
import { Room } from '../entities/room.entity';
import { MessageType } from '../type/message.type';

export class CreateMessageDto {
  type: MessageType;
  content: string;
  sender: Participant;
  room: Room;
  notRead: Array<Participant['id']>;
}
