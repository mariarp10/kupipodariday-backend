import { IsString, MinLength } from 'class-validator';

export class FindUserDto {
  @IsString()
  @MinLength(1)
  query: string;
}
