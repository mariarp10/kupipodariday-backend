import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { TAuthedUser } from 'src/auth/authedUser.type';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Controller('wishlistlists')
@UseGuards(JwtGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  create(
    @Req() req: Request & { user: TAuthedUser },
    @Body() dto: CreateWishlistDto,
  ) {
    return this.wishlistService.create(req.user, dto);
  }

  @Get()
  findAll() {
    return this.wishlistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishlistService.findOne({
      where: { id },
      relations: ['items', 'owner'],
    });
  }

  @Delete(':id')
  remove(
    @Req() req: Request & { user: TAuthedUser },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.wishlistService.deleteCollection(req.user, id);
  }

  @Patch(':id')
  updateCollection(
    @Req() req: Request & { user: TAuthedUser },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWishlistDto,
  ) {
    return this.wishlistService.updateCollection(req.user, id, dto);
  }
}
