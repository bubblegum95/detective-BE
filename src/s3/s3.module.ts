import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3Controller } from './s3.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/s3.entity';

@Module({
  controllers: [S3Controller],
  providers: [S3Service],
  exports: [S3Service],
  imports: [TypeOrmModule.forFeature([File])],
})
export class S3Module {}
