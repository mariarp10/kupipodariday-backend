import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { Repository, FindOneOptions } from 'typeorm';
import { TAuthedUser } from '../auth/authedUser.type';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private readonly wishesRepository: Repository<Wish>,
  ) {}

  async create(user: TAuthedUser, dto: CreateWishDto) {
    const wish = {
      ...dto,
      owner: user,
    };

    const existing = await this.wishesRepository.findOne({
      where: { link: dto.link, owner: { id: user.id } },
    });

    if (existing) {
      throw new ConflictException('Такой wish уже существует');
    }

    return this.wishesRepository.save(wish);
  }

  async findAll() {
    return this.wishesRepository.find();
  }

  async findOne(options: FindOneOptions<Wish>) {
    const wish = await this.wishesRepository.findOne(options);

    if (!wish) {
      throw new NotFoundException('Подарок не найден');
    }

    return wish;
  }

  async remove(id: number) {
    await this.wishesRepository.delete(id);
  }

  async update(wish: Wish, dto: UpdateWishDto) {
    return this.wishesRepository.save({
      ...wish,
      ...dto,
    });
  }

  async removeWish(id: number, userId: number) {
    const wish = await this.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Нельзя удалить чужой подарок');
    }

    await this.remove(id);

    return wish;
  }

  async getLatest() {
    return this.wishesRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 40,
    });
  }

  async getPopularWishes() {
    return this.wishesRepository.find({
      order: {
        copied: 'DESC',
      },
      take: 20,
    });
  }

  async updateWish(wishId: number, dto: UpdateWishDto, userId: number) {
    const wish = await this.findOne({
      where: { id: wishId },
      relations: ['owner', 'offers'],
    });

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('Нельзя изменить чужой подарок');
    }

    if (dto.price !== undefined && wish.offers.length > 0) {
      throw new ForbiddenException(
        'Нельзя изменить цену на подарок, если уже есть желающие скинуться',
      );
    }

    if (dto.description !== undefined && wish.offers.length > 0) {
      throw new ForbiddenException(
        'Нельзя изменить описание подарка, если уже есть желающие скинуться',
      );
    }

    return this.update(wish, dto);
  }

  async copyWish(user: TAuthedUser, wishId: number) {
    const originalWish = await this.findOne({ where: { id: wishId } });

    const dto: CreateWishDto = {
      name: originalWish.name,
      link: originalWish.link,
      image: originalWish.image,
      price: originalWish.price,
      description: originalWish.description,
    };

    const result = await this.create(user, dto);

    await this.wishesRepository.increment({ id: originalWish.id }, 'copied', 1);

    return result;
  }
}
