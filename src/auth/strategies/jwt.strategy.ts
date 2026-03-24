import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(jwtPayload: { sub: number }) {
    const user = await this.usersService.findOneOrNull({ id: jwtPayload.sub });

    if (!user) {
      throw new UnauthorizedException(
        'Пользователь не найден или токен недействителен',
      );
    }

    const { password: _password, ...result } = user;

    return result;
  }
}
