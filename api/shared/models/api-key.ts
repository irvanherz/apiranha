import { Expose } from 'class-transformer';

export class ApiKey {
    @Expose()
    pk: string;

    @Expose()
    sk: string;

    @Expose()
    name: string;

    @Expose()
    secret: string;

    @Expose()
    userId: string;

    @Expose()
    createdAt: number;

    @Expose()
    updatedAt: number;
}
