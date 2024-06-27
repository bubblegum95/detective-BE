import { Module } from '@nestjs/common';
import { DetectiveofficeService } from './detectiveoffice.service';
import { DetectiveofficeController } from './detectiveoffice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Detective } from 'src/user/entities/detective.entity';
import { DetectiveOffice } from './entities/detective-office.entity';
import { OfficeRelationship } from './entities/office-relationship.entity';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([JwtModule, Detective, DetectiveOffice, OfficeRelationship]),
  ],
  controllers: [DetectiveofficeController],
  providers: [DetectiveofficeService, JwtAuthGuard],
})
export class DetectiveofficeModule {}
