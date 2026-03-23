import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, FindOptionsWhere, DeepPartial, ILike } from 'typeorm';
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

  async findAll(query?: FindOptionsWhere<User>) {
    if (!query) {
      return this.usersRepository.find();
    }

    return this.usersRepository.find({ where: query });
  }

  async findOne(query: FindOptionsWhere<User>) {
    const user = await this.usersRepository.findOne({ where: query });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.findOne({ id });

    const updatedUser = { ...user, ...dto };

    await this.usersRepository.save(updatedUser);

    const { password: _password, ...rest } = await this.findOne({ id });

    return rest;
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

  async findOneOrNull(query: FindOptionsWhere<User>) {
    return this.usersRepository.findOne({ where: query });
  }

  async updateUserProfile(id: number, dto: UpdateUserDto) {
    const user = await this.findOne({ id });

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
}
