import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { TAuthedRequest } from '../auth/types';

@Controller('offers')
@UseGuards(JwtGuard)
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Req() req: TAuthedRequest, @Body() createOfferDto: CreateOfferDto) {
    return this.offersService.addOffer(req.user, createOfferDto);
  }

  @Get()
  findAll() {
    return this.offersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.offersService.findOne({ where: { id } });
  }
}
