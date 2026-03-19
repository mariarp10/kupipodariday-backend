import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignInUserDto } from './dto/sign-in.dto';
import { PasswordService } from './password.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(dto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmailOrUsername(
      dto.email,
      dto.username,
    );

    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким email или username уже существует',
      );
    }

    const hashedPassword = await this.passwordService.hashPassword(
      dto.password,
    );

    const newUser = {
      ...dto,
      password: hashedPassword,
    };

    return this.usersService.create(newUser);
  }

  login(dto: SignInUserDto) {
    return 'This is a login method';
  }
}
