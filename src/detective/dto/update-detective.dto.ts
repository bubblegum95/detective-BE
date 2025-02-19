import { PartialType } from '@nestjs/swagger';
import { CreateDetectiveDto } from './create-detective.dto';
import { Office } from '../../office/entities/office.entity';
import { User } from '../../user/entities/user.entity';

export class UpdateDetectiveDto extends PartialType(CreateDetectiveDto) {
  subject: string;
  intro: string;
  user?: User;
  office?: Office;
}
