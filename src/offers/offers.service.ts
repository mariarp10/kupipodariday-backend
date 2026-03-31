import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { Repository, FindOneOptions } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { TAuthedUser } from '../auth/types';
import { WishesService } from '../wishes/wishes.service';
import { Wish } from '../wishes/entities/wish.entity';

@Injectable()
export class OffersService {
  private toCents(value: number | string): number {
    return Math.round(Number(value) * 100);
  }

  constructor(
    @InjectRepository(Offer)
    private readonly offersRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}

  async create(user: TAuthedUser, wish: Wish, dto: CreateOfferDto) {
    return this.offersRepository.save({
      item: wish,
      user,
      amount: dto.amount,
      hidden: dto.hidden,
    });
  }

  findAll() {
    return this.offersRepository.find({ relations: ['user', 'item'] });
  }

  async findOne(options: FindOneOptions<Offer>) {
    const offer = await this.offersRepository.findOne(options);

    if (!offer) {
      throw new NotFoundException('Предложение не найдено');
    }

    return offer;
  }

  remove(offer: Offer) {
    return this.offersRepository.remove(offer);
  }

  async addOffer(user: TAuthedUser, dto: CreateOfferDto) {
    return this.offersRepository.manager.transaction(async (manager) => {
      const wishesRepository = manager.getRepository(Wish);
      const offersRepository = manager.getRepository(Offer);

      const wish = await wishesRepository.findOne({
        where: { id: dto.itemId },
        relations: ['owner'],
      });

      if (!wish) {
        throw new NotFoundException('Подарок не найден');
      }

      const priceInCents = this.toCents(wish.price);
      const raisedInCents = this.toCents(wish.raised);
      const amountInCents = this.toCents(dto.amount);
      const remainingBalance = priceInCents - raisedInCents;

      if (wish.owner.id === user.id) {
        throw new ForbiddenException('Нельзя скидываться на свой подарок');
      }

      if (raisedInCents >= priceInCents) {
        throw new ForbiddenException(
          'Нельзя скидываться на подарок, на который уже собраны деньги',
        );
      }

      if (amountInCents > remainingBalance) {
        throw new ForbiddenException(
          'Сумма взноса не должна превышать остаток',
        );
      }

      const offer = offersRepository.create({
        item: wish,
        user,
        amount: dto.amount,
        hidden: dto.hidden ?? false,
      });

      const createdOffer = await offersRepository.save(offer);

      await wishesRepository.increment({ id: wish.id }, 'raised', dto.amount);

      return createdOffer;
    });
  }
}
