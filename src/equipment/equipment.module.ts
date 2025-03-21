import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';

@Module({
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
  imports: [TypeOrmModule.forFeature([Equipment])],
})
export class EquipmentModule {}
