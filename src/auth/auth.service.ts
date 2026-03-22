import { Injectable, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PasswordService } from './password.service';
import { JwtService } from '@nestjs/jwt';
import { TAuthedUser } from './authedUser.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

    const { password: _password, ...result } = await this.usersService.create(
      newUser,
    );

    return result;
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findOneOrNull({ username });

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.passwordService.verifyPassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return null;
    }

    const { password: _password, ...result } = user;

    return result;
  }

  auth(user: TAuthedUser) {
    const payload = { sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
