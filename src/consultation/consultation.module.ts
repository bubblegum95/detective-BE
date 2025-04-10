import { Module } from '@nestjs/common';
import { ConsultationService } from './consultation.service';
import { ConsultationController } from './consultation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consultation } from './entities/consultation.entity';
import { UserModule } from '../user/user.module';
import { DetectiveModule } from '../detective/detective.module';
import { CategoryModule } from '../category/category.module';

@Module({
  controllers: [ConsultationController],
  providers: [ConsultationService],
  exports: [],
  imports: [TypeOrmModule.forFeature([Consultation]), UserModule, DetectiveModule, CategoryModule],
})
export class ConsultationModule {}
