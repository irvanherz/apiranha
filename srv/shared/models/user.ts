import { Exclude, Expose } from 'class-transformer';

export class User {
    @Expose()
    pk: string;
    @Expose()
    sk: string;

    @Expose()
    email: string;
    @Expose()
    username: string;
    @Expose()
    fullName: string;
    @Exclude()
    password: string;
    @Expose()
    createdAt: number;
    @Expose()
    updatedAt: number;
}
