import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../shared/config';
import { Repository } from '../shared/repository';
import { StdError } from '../shared/std-error';
import { UserService } from '../user/service';
import { AuthResultDto } from './dto/auth-result.dto';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';

export class AuthService {
    static async login(input: LoginInput) {
        const pk = input.usernameOrEmail.includes('@')
            ? `USER#EMAIL#${input.usernameOrEmail}`
            : `USER#USERNAME#${input.usernameOrEmail}`;
        const sk = pk;
        const target = await Repository.find(pk, sk);
        if (!target) throw new StdError('Invalid credentials', 'invalid-credentials', 400);
        const user = await Repository.find(target.userId, target.userId);
        if (!user) throw new StdError('Invalid credentials', 'invalid-credentials', 400);
        const passwordMatch = await bcrypt.compare(input.password, user.password);
        if (!passwordMatch) throw new StdError('Invalid credentials', 'invalid-credentials', 400);
        const [accessToken, refreshToken] = AuthService.generateTokens(user);
        const result = {
            accessToken,
            refreshToken,
            user,
        };
        return plainToInstance(AuthResultDto, result, { excludeExtraneousValues: true });
    }

    static async register(input: RegisterInput) {
        const isUsernameAvailable = await UserService.isUsernameAvailable(input.username);
        if (!isUsernameAvailable) throw new StdError('Username is already taken', 'username-taken', 400);
        const isEmailAvailable = await UserService.isEmailAvailable(input.email);
        if (!isEmailAvailable) throw new StdError('Email is already registered', 'email-unavailable', 400);

        const pk = `USER#${randomUUID().toString()}`;
        const sk = pk;
        const now = dayjs().valueOf();

        const userInput = {
            pk,
            sk,
            ...input,
            createdAt: now,
            updatedAt: now,
            gsi1pk: 'USER',
            gsi1sk: pk,
        };
        userInput.password = await bcrypt.hash(userInput.password || '', 10);

        const [created] = await Repository.batchSave(
            userInput,
            {
                pk: `USER#USERNAME#${userInput.username}`,
                sk: `USER#USERNAME#${userInput.username}`,
                userId: userInput.pk,
            },
            { pk: `USER#EMAIL#${userInput.email}`, sk: `USER#EMAIL#${userInput.email}`, userId: userInput.pk },
        );
        if (created.length === 0) throw new StdError('Failed to create user', 'create-failed', 500);
        const user = created[0];

        const [accessToken, refreshToken] = AuthService.generateTokens(user);
        const result = {
            accessToken,
            refreshToken,
            user,
        };
        return plainToInstance(AuthResultDto, result, { excludeExtraneousValues: true });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static generateTokens(user: Record<string, any>) {
        const id = user.pk.split('#')[1];
        const role = 'USER';

        const accessToken = jwt.sign({ id, role }, JWT_SECRET, {
            expiresIn: '1h',
        });
        const refreshToken = jwt.sign({ id }, JWT_SECRET, {
            expiresIn: '48h',
        });
        return [accessToken, refreshToken] as [string, string];
    }
}
