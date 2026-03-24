import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Repository,
  FindOptionsWhere,
  FindOneOptions,
  DeepPartial,
  ILike,
} from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PasswordService } from '../password/password.service';
import { FindUserDto } from './dto/find-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async create(newUser: DeepPartial<User>) {
    return this.usersRepository.save(newUser);
  }

  async findAll() {
    return this.usersRepository.find();
  }

  async findOne(options: FindOneOptions<User>) {
    const user = await this.usersRepository.findOne(options);

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne({ where: { id } });
    const { password: _password, ...rest } = await this.usersRepository.save({
      ...user,
      ...dto,
    });

    return rest;
  }

  async remove(id: number) {
    const user = await this.findOne({ where: { id } });

    await this.usersRepository.delete(id);

    return user;
  }

  async findByEmailOrUsername(email: string, username: string) {
    return this.usersRepository.findOne({
      where: [{ email }, { username }],
    });
  }

  async findOneOrNull(query: FindOptionsWhere<User>) {
    return this.usersRepository.findOne({ where: query });
  }

  async findUserWithPassword(username: string) {
    return this.usersRepository.findOne({
      where: { username },
      select: {
        id: true,
        username: true,
        about: true,
        avatar: true,
        email: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUserProfile(id: number, dto: UpdateUserDto) {
    const user = await this.findOne({ where: { id } });

    if (dto.username && dto.username !== user.username) {
      const duplicateExist = !!(await this.findOneOrNull({
        username: dto.username,
      }));

      if (duplicateExist) {
        throw new ConflictException('Этот username уже занят');
      }
    }

    if (dto.email && dto.email !== user.email) {
      const duplicateExist = !!(await this.findOneOrNull({
        email: dto.email,
      }));

      if (duplicateExist) {
        throw new ConflictException('Этот email уже занят');
      }
    }

    if (dto.password) {
      const hashedPassword = await this.passwordService.hashPassword(
        dto.password,
      );

      return this.update(id, {
        ...dto,
        password: hashedPassword,
      });
    }

    return this.update(id, dto);
  }

  async findMany(dto: FindUserDto) {
    return this.usersRepository.find({
      where: [
        { username: ILike(`%${dto.query}%`) },
        { email: ILike(`%${dto.query}%`) },
      ],
    });
  }

  async getOwnWishes(id: number) {
    const user = await this.findOne({
      where: { id },
      relations: ['wishes'],
    });

    return user.wishes;
  }

  async getAnotherUserWishes(username: string) {
    const user = await this.findOne({
      where: { username },
      relations: ['wishes'],
    });

    return user.wishes;
  }
}
