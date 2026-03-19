import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PasswordService } from './password.service';
import { UsersModule } from 'src/users/users.module';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [PasswordService, AuthService],
  // мб и не нужно его экспортировать
  exports: [AuthService],
})
export class AuthModule {}
