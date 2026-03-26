import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { TAuthedUser } from '../auth/authedUser.type';
import { WishesService } from '../wishes/wishes.service';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async create(user: TAuthedUser, dto: CreateWishlistDto) {
    const uniqueIds = [...new Set(dto.itemsId)];
    const items = await this.wishesService.findByIds(uniqueIds);

    if (items.length !== uniqueIds.length) {
      throw new NotFoundException('Некоторые подарки не найдены');
    }

    const wishlist = {
      name: dto.name,
      image: dto.image,
      owner: user,
      items,
    };

    return this.wishlistRepository.save(wishlist);
  }

  async findAll() {
    return this.wishlistRepository.find({ relations: ['owner', 'items'] });
  }

  async findOne(options: FindOneOptions<Wishlist>) {
    const wishlist = await this.wishlistRepository.findOne(options);

    if (!wishlist) {
      throw new NotFoundException('Коллекция не найдена');
    }

    return wishlist;
  }

  async remove(wishlist: Wishlist) {
    return this.wishlistRepository.remove(wishlist);
  }

  async deleteCollection(user: TAuthedUser, id: number) {
    const collection = await this.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (user.id !== collection.owner.id) {
      throw new ForbiddenException('Нельзя удалить чужую коллекцию');
    }

    return this.remove(collection);
  }

  async updateCollection(
    user: TAuthedUser,
    id: number,
    dto: UpdateWishlistDto,
  ) {
    const wishlist = await this.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });

    if (user.id !== wishlist.owner.id) {
      throw new ForbiddenException('Нельзя изменить чужую коллекцию');
    }

    if (dto.name !== undefined) {
      wishlist.name = dto.name;
    }

    if (dto.image !== undefined) {
      wishlist.image = dto.image;
    }

    if (dto.itemsId !== undefined) {
      const uniqueIds = [...new Set(dto.itemsId)];
      const items = await this.wishesService.findByIds(uniqueIds);

      if (items.length !== uniqueIds.length) {
        throw new NotFoundException('Некоторые подарки не найдены');
      }

      wishlist.items = items;
    }

    await this.wishlistRepository.save(wishlist);

    return this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });
  }
}
