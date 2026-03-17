import { IsEmail, IsUrl, Length, IsString } from 'class-validator';
export class CreateUserDto {
  @IsString()
  @Length(2, 30)
  username: string;

  @IsString()
  @Length(2, 200)
  about?: string;

  @IsString()
  @IsUrl()
  avatar?: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
