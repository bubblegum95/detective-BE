import { Injectable } from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { WishList } from './entities/wish-list.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Detective } from '../detective/entities/detective.entity';
import { DetectiveService } from '../detective/detective.service';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(WishList) private readonly wishlistRepository: Repository<WishList>,
    private readonly userService: UserService,
    private readonly detectiveService: DetectiveService,
  ) {}

  async findConsumer(userId: User['id']) {
    return await this.userService.findOneById(userId);
  }

  async findDetective(detectiveId: Detective['id']) {
    return await this.detectiveService.findOne(detectiveId);
  }

  async create(dto: CreateWishlistDto) {
    return await this.wishlistRepository.save({ ...dto });
  }

  async findAll(userId: User['id']) {
    return await this.wishlistRepository
      .createQueryBuilder('wishlist')
      .leftJoin('wishlist.consumer', 'consumer')
      .leftJoin('wishlist.detective', 'detective')
      .leftJoin('detective.user', 'user')
      .where('consumer.id = :userId', { userId })
      .addSelect(['detective.id', 'user.name', 'user.email', 'user.phoneNumber'])
      .getManyAndCount();
  }

  async findOne(id: WishList['id']) {
    return await this.wishlistRepository.findOne({ where: { id }, relations: ['consumer'] });
  }

  async isWish(userId: User['id'], detectiveId: Detective['id']) {
    return await this.wishlistRepository
      .createQueryBuilder('wish')
      .leftJoin('wish.detective', 'detective')
      .leftJoin('wish.consumer', 'consumer')
      .where('detective.id = :detectiveId', { detectiveId })
      .andWhere('consumer.id = :userId', { userId })
      .getOne();
  }

  async remove(id: WishList['id']) {
    return await this.wishlistRepository.delete({ id });
  }
}
