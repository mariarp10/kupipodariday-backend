import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { SignInUserDto } from './dto/sign-in.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('signin')
  login(@Body() dto: SignInUserDto) {
    return this.authService.login(dto);
  }
}
