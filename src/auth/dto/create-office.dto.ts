import { IsString } from 'class-validator';
import { User } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOfficeDto {
  @IsString()
  @ApiProperty({ description: '회사명' })
  name: string;
  businessNum: string;
  founded: string;
  address: string;
  addressDetail: string;
  owner: User;
}
