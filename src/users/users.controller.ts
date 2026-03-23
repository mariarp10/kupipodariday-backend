import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { TAuthedUser } from 'src/auth/authedUser.type';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtGuard)
  getOwnUser(@Req() req: Request & { user: TAuthedUser }) {
    return req.user;
  }

  @Patch('me')
  @UseGuards(JwtGuard)
  updateUserProfile(
    @Req() req: Request & { user: TAuthedUser },
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateUserProfile(req.user.id, dto);
  }

  @Get(':username')
  @UseGuards(JwtGuard)
  findOne(@Param('username') username: string) {
    return this.usersService.findOne({ username });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove({ id });
  }
}
