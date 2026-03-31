import { User } from '../users/entities/user.entity';
import { Request } from '@nestjs/common';

export type TAuthedUser = Omit<User, 'password'>;

export type TAuthedRequest = Request & { user: TAuthedUser };
