import { Injectable } from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { Repository, FindOptionsWhere } from 'typeorm';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private readonly wishesRepository: Repository<Wish>,
  ) {}

  create(dto: CreateWishDto) {
    return this.wishesRepository.save(dto);
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
