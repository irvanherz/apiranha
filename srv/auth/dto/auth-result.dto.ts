import { Expose } from 'class-transformer';
import { User } from '../../shared/models/user';

export class AuthResultDto {
    @Expose()
    accessToken: string;
    @Expose()
    refreshToken: string;
    @Expose()
    expiredAt: number;
    @Expose()
    user: User;
}
