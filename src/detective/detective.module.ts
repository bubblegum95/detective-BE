import { Module } from '@nestjs/common';
import { DetectiveService } from './detective.service';
import { DetectiveController } from './detective.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Detective } from './entities/detective.entity';
import { UserModule } from '../user/user.module';
import { OfficeModule } from '../office/office.module';

@Module({
  controllers: [DetectiveController],
  providers: [DetectiveService],
  exports: [DetectiveService],
  imports: [TypeOrmModule.forFeature([Detective]), UserModule, OfficeModule],
})
export class DetectiveModule {}
