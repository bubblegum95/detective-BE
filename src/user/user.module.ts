import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Detective } from './entities/detective.entity';
import { WishList } from './entities/wish-list.entity';
import { Room } from '../chat/entities/room.entity';
import { DataSource } from 'typeorm';
import { Participant } from './entities/participant.entity';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [TypeOrmModule.forFeature([User, Detective, WishList, Room, Participant])],
})
export class UserModule {}
