import { Module } from '@nestjs/common';
import { RegionService } from './region.service';
import { RegionController } from './region.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Region } from './entities/region.entity';

@Module({
  controllers: [RegionController],
  providers: [RegionService],
  imports: [TypeOrmModule.forFeature([Region])],
})
export class RegionModule {}
