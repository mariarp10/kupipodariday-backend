import { User } from '../users/entities/user.entity';
export type TAuthedUser = Omit<User, 'password'>;
