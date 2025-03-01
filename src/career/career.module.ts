import { Module } from '@nestjs/common';
import { CareerController } from './career.controller';
import { CareerService } from './career.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Career } from './entities/career.entity';
import { UserModule } from '../user/user.module';

@Module({
  controllers: [CareerController],
  providers: [CareerService],
  exports: [CareerService],
  imports: [TypeOrmModule.forFeature([Career]), UserModule],
})
export class CareerModule {}
