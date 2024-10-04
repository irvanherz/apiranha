import { marshall } from '@aws-sdk/util-dynamodb';
import bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import { User } from '../shared/models/user';
import { Repository } from '../shared/repository';
import { StdError } from '../shared/std-error';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UsersQueryInput } from './dto/users-query.input';

export class UserService {
    static async createUser(input: CreateUserInput) {
        const pk = `USER#${randomUUID().toString()}`;
        const sk = pk;

        const isUsernameAvailable = await UserService.isUsernameAvailable(input.username);
        if (!isUsernameAvailable) throw new StdError('Username is already taken', 'username-taken', 400);
        const isEmailAvailable = await UserService.isEmailAvailable(input.email);
        if (!isEmailAvailable) throw new StdError('Email is already registered', 'email-unavailable', 400);

        const now = dayjs().valueOf();
        const user = {
            pk,
            sk,
            ...input,
            createdAt: now,
            updatedAt: now,
            gsi1pk: 'USER',
            gsi1sk: pk,
        };
        user.password = await bcrypt.hash(user.password || '', 10);

        const [created] = await Repository.batchSave(
            user,
            { pk: `USER#USERNAME#${user.username}`, sk: `USER#USERNAME#${user.username}`, userId: user.pk },
            { pk: `USER#EMAIL#${user.email}`, sk: `USER#EMAIL#${user.email}`, userId: user.pk },
        );
        if (created.length === 0) throw new StdError('Failed to create user', 'create-failed', 500);
        const createdUser = created[0];

        return plainToInstance(User, createdUser, { excludeExtraneousValues: true });
    }

    static async findUsers(filter: UsersQueryInput) {
        const [data, count] = await Repository.query({
            IndexName: 'GSI1',
            KeyConditionExpression: 'gsi1pk = :pk',
            Limit: filter.limit,
            ExpressionAttributeValues: marshall({ ':pk': 'USER' }),
            // ExclusiveStartKey: { pk: { S: '1' }, sk: { S: 'profile' } },
        });
        return [data, count];
    }

    static async findUser(id: string) {
        const pk = `USER#${id}`;
        const sk = pk;

        const user = await Repository.find(pk, sk);

        return plainToInstance(User, user, { excludeExtraneousValues: true });
    }

    static async updateUser(id: string, input: UpdateUserInput) {
        const pk = `USER#${id}`;
        const sk = pk;

        const user = await Repository.find(pk, sk);
        if (!user) throw new StdError('User not found', 'user-not-found', 404);

        if (input.password) user.password = await bcrypt.hash(input.password, 10);
        user.updatedAt = dayjs().valueOf();

        Object.assign(user, Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== undefined)));

        const updated = await Repository.save(user);
        if (!updated) throw new StdError('Failed to update user', 'update-failed', 500);

        return plainToInstance(User, updated);
    }

    static async deleteUser(id: string) {
        const pk = `USER#${id}`;
        const sk = pk;

        const user = await Repository.find(pk, sk);
        if (!user) throw new StdError('User not found', 'user-not-found', 404);
        const ok = await Repository.delete(pk, sk);
        if (!ok) throw new StdError('Failed to delete user', 'delete-failed', 500);

        return plainToInstance(User, user, { excludeExtraneousValues: true });
    }

    static async isUsernameAvailable(username: string) {
        const pk = `USER#USERNAME#${username}`;
        const sk = pk;
        const result = await Repository.find(pk, sk);
        return !result;
    }

    static async isEmailAvailable(email: string) {
        const pk = `USER#EMAIL#${email}`;
        const sk = pk;
        const result = await Repository.find(pk, sk);
        return !result;
    }
}
