import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

const saltRounds = 10;

@Injectable()
export class PasswordService {
  async hashPassword(rawPassword: string): Promise<string> {
    return bcrypt.hash(rawPassword, saltRounds);
  }

  async verifyPassword(
    rawPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(rawPassword, hashedPassword);
  }
}
