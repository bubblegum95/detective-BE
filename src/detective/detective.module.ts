import { Module } from '@nestjs/common';
import { DetectiveService } from './detective.service';
import { DetectiveController } from './detective.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Detective } from './entities/detective.entity';
import { UserModule } from '../user/user.module';
import { S3Module } from '../s3/s3.module';

@Module({
  controllers: [DetectiveController],
  providers: [DetectiveService],
  exports: [DetectiveService],
  imports: [TypeOrmModule.forFeature([Detective]), UserModule, S3Module],
})
export class DetectiveModule {}
