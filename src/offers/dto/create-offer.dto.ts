import { IsNumber, IsOptional, IsBoolean } from 'class-validator';
export class CreateOfferDto {
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsOptional()
  @IsBoolean()
  hidden?: boolean;

  @IsNumber()
  itemId: number;
}
