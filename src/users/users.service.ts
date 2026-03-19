import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(newUser: DeepPartial<User>) {
    return this.usersRepository.save(newUser);
  }

  async findAll() {
    return this.usersRepository.find();
  }

  async findOne(query: FindOptionsWhere<User>) {
    const user = await this.usersRepository.findOne({ where: query });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  update(query: FindOptionsWhere<User>, dto: UpdateUserDto) {
    return this.usersRepository.update(query, dto);
  }

  async remove(query: FindOptionsWhere<User>) {
    const user = await this.findOne(query);

    await this.usersRepository.delete(query);

    return user;
  }

  async findByEmailOrUsername(email: string, username: string) {
    return this.usersRepository.findOne({
      where: [{ email: email }, { username: username }],
    });
  }
}
