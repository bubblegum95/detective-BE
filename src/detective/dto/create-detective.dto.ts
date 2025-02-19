import { Office } from '../../office/entities/office.entity';
import { User } from '../../user/entities/user.entity';

export class CreateDetectiveDto {
  subject: string;
  intro: string;
  user: User;
  office: Office;
}
