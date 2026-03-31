import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Post,
  ParseIntPipe,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { TAuthedRequest } from '../auth/types';
import { FindUserDto } from './dto/find-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtGuard)
  getOwnUser(@Req() req: TAuthedRequest) {
    return req.user;
  }

  @Patch('me')
  @UseGuards(JwtGuard)
  updateUserProfile(@Req() req: TAuthedRequest, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUserProfile(req.user.id, dto);
  }

  @Get('me/wishes')
  @UseGuards(JwtGuard)
  getOwnWishes(@Req() req: TAuthedRequest) {
    return this.usersService.getOwnWishes(req.user.id);
  }

  @Post('find')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  queryUser(@Body() dto: FindUserDto) {
    return this.usersService.findMany(dto);
  }

  @Get(':username')
  @UseGuards(JwtGuard)
  findOne(@Param('username') username: string) {
    return this.usersService.findOne({ where: { username } });
  }

  @Get(':username/wishes')
  @UseGuards(JwtGuard)
  getAnotherUserWishes(@Param('username') username: string) {
    return this.usersService.getAnotherUserWishes(username);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
