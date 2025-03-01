import { Module } from '@nestjs/common';
import { OfficeService } from './office.service';
import { OfficeController } from './office.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Office } from './entities/office.entity';
import { UserModule } from '../user/user.module';
import { ApplicationService } from './application.service';
import { Application } from './entities/application.entity';
import { DetectiveModule } from '../detective/detective.module';

@Module({
  controllers: [OfficeController],
  providers: [OfficeService, ApplicationService],
  exports: [OfficeService, ApplicationService],
  imports: [UserModule, DetectiveModule, TypeOrmModule.forFeature([Office, Application])],
})
export class OfficeModule {}
