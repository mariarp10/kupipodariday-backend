import { ConflictException, Injectable } from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { Repository, FindOptionsWhere } from 'typeorm';
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

    const exsisting = await this.findOne({
      link: dto.link,
      owner: { id: user.id },
    });

    if (exsisting) {
      throw new ConflictException('Такой wish уже существует');
    }

    return this.wishesRepository.save(wish);
  }

  findAll() {
    return this.wishesRepository.find();
  }

  findOne(query: FindOptionsWhere<Wish>) {
    return this.wishesRepository.findOne({ where: query });
  }

  update(id: number, dto: UpdateWishDto) {
    return `This action updates a #${id} wish`;
  }

  remove(id: number) {
    return `This action removes a #${id} wish`;
  }

  async getLatest() {
    return this.wishesRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: 40,
    });
  }
}
