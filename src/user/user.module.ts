import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { WishList } from './entities/wish-list.entity';
import { Room } from '../chat/entities/room.entity';
import { Participant } from './entities/participant.entity';
import { File } from '../s3/entities/s3.entity';
import { S3Module } from '../s3/s3.module';
import { Detective } from '../detective/entities/detective.entity';

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
  imports: [
    TypeOrmModule.forFeature([User, Detective, WishList, Room, Participant, File]),
    S3Module,
  ],
})
export class UserModule {}
