import { File } from '../../s3/entities/s3.entity';
import { User } from '../../user/entities/user.entity';

export class CreateOfficeDto {
  name: string;
  businessNum: string;
  founded: string;
  address: string;
  addressDetail: string;
  owner: User;
  businessFile: File;
}
