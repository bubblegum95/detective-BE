import { Module } from '@nestjs/common';
import { CareerController } from './career.controller';
import { CareerService } from './career.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Career } from './entities/career.entity';

@Module({
  controllers: [CareerController],
  providers: [CareerService],
  imports: [TypeOrmModule.forFeature([Career])],
})
export class CareerModule {}
