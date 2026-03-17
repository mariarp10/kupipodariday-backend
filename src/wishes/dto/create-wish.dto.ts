import { IsUrl, Length, IsNumber, IsString } from 'class-validator';
export class CreateWishDto {
  @IsString()
  @Length(1, 250)
  name: string;

  @IsString()
  @IsUrl()
  link: string;

  @IsString()
  @IsUrl()
  image: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @IsString()
  @Length(1, 1024)
  description: string;
}
