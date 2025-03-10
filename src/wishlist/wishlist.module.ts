import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishList } from './entities/wish-list.entity';
import { UserModule } from '../user/user.module';
import { DetectiveModule } from '../detective/detective.module';

@Module({
  controllers: [WishlistController],
  providers: [WishlistService],
  imports: [TypeOrmModule.forFeature([WishList]), UserModule, DetectiveModule],
})
export class WishlistModule {}
