import { Module } from '@nestjs/common';
import { DetectiveService } from './detective.service';
import { DetectiveController } from './detective.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Detective } from './entities/detective.entity';
import { UserModule } from '../user/user.module';
import { S3Module } from '../s3/s3.module';
import { RedisModule } from '../redis/redis.module';
import { CategoryModule } from '../category/category.module';
import { User } from '../user/entities/user.entity';
import { DetectiveCategory } from './entities/detectiveCategory.entity';
import { DetectiveEquipment } from './entities/detectiveEquipment.entity';
import { DetectiveRegion } from './entities/detectiveRegion.entity';
import { EquipmentModule } from '../equipment/equipment.module';
import { RegionModule } from '../region/region.module';

@Module({
  controllers: [DetectiveController],
  providers: [DetectiveService],
  exports: [DetectiveService],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Detective,
      DetectiveCategory,
      DetectiveEquipment,
      DetectiveRegion,
    ]),
    UserModule,
    S3Module,
    RedisModule,
    CategoryModule,
    EquipmentModule,
    RegionModule,
  ],
})
export class DetectiveModule {}
