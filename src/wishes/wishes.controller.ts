import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { TAuthedUser } from '../auth/authedUser.type';

@Controller('wishes')
@UseGuards(JwtGuard)
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  create(
    @Req() req: Request & { user: TAuthedUser },
    @Body() dto: CreateWishDto,
  ) {
    return this.wishesService.create(req.user, dto);
  }
  // в swagger нет этого эндроинта
  @Get()
  findAll() {
    return this.wishesService.findAll();
  }

  @Get('last')
  getLatest() {
    return this.wishesService.getLatest();
  }

  @Get('top')
  getPopularWishes() {
    return this.wishesService.getPopularWishes();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.findOne({ where: { id }, relations: ['owner'] });
  }

  @Patch(':id')
  updateWish(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWishDto: UpdateWishDto,
    @Req() req: Request & { user: TAuthedUser },
  ) {
    return this.wishesService.updateWish(id, updateWishDto, req.user.id);
  }

  @Delete(':id')
  deleteWish(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request & { user: TAuthedUser },
  ) {
    return this.wishesService.removeWish(id, req.user.id);
  }

  @Post(':id/copy')
  copyWish(
    @Req() req: Request & { user: TAuthedUser },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.wishesService.copyWish(req.user, id);
  }
}
