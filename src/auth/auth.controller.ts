import { Controller, Body, Post, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalGuard } from './guards/local.guard';
import { TAuthedUser } from './authedUser.type';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async register(@Body() dto: CreateUserDto) {
    const newUser = await this.authService.register(dto);

    return this.authService.auth(newUser);
  }

  @UseGuards(LocalGuard)
  @Post('signin')
  async login(@Req() req: Request & { user: TAuthedUser }) {
    return this.authService.auth(req.user);
  }
}
