import { Module } from '@nestjs/common';
import { DetectiveofficeService } from './detectiveoffice.service';
import { DetectiveofficeController } from './detectiveoffice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Detective } from 'src/user/entities/detective.entity';
import { DetectiveOffice } from './entities/detective-office.entity';
import { OfficeRelationship } from './entities/office-relationship.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { EmailModule } from 'src/mail/email.module';
import { UserModule } from 'src/user/user.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [
    RedisModule,
    EmailModule,
    UserModule,
    AuthModule,
    TypeOrmModule.forFeature([Detective, DetectiveOffice, OfficeRelationship]),
  ],
  controllers: [DetectiveofficeController],
  providers: [DetectiveofficeService, JwtAuthGuard],
})
export class DetectiveofficeModule {}
