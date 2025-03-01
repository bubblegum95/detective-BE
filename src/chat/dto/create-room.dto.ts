import { IsString } from 'class-validator';
import { User } from '../../user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Room } from '../entities/room.entity';

export class CreateRoomDto {
  @IsString()
  @ApiProperty({ description: '초대할 사용자 이메일', example: 'example@email.com' })
  email: User['email'];
}

export class CreatedRoomDto {
  @IsString()
  @ApiProperty({ description: '생성된 룸 아이디' })
  room: Room['id'];
}
