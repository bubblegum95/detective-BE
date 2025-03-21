import { File } from '../../s3/entities/s3.entity';

export class UpdateDetectiveDao {
  subject?: string;
  intro?: string;
  profile?: File;
}
