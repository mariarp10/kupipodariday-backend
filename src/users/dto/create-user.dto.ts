import { IsEmail, IsUrl, Length, IsString, IsOptional } from 'class-validator';
export class CreateUserDto {
  @IsString()
  @Length(2, 30)
  username: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  about?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  avatar?: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
