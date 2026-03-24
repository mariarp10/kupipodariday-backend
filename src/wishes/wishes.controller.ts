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
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  @UseGuards(JwtGuard)
  create(
    @Req() req: Request & { user: TAuthedUser },
    @Body() dto: CreateWishDto,
  ) {
    return this.wishesService.create(req.user, dto);
  }

  @Get()
  findAll() {
    return this.wishesService.findAll();
  }

  @Get('last')
  getLatest() {
    return this.wishesService.getLatest();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.wishesService.findOne({ id });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWishDto: UpdateWishDto) {
    return this.wishesService.update(+id, updateWishDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wishesService.remove(+id);
  }
}
