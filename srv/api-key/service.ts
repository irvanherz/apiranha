import { marshall } from '@aws-sdk/util-dynamodb';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import { ApiKey } from '../shared/models/api-key';
import { Repository } from '../shared/repository';
import { StdError } from '../shared/std-error';
import { CreateApiKeyInput } from './dto/create-api-key.input';
import { UpdateApiKeyInput } from './dto/update-api-key.input';

export class ApiKeyService {
    static async createApiKey(input: CreateApiKeyInput) {
        const pk = `APIKEY#${randomUUID().toString()}`;
        const sk = pk;

        const secret = randomUUID().toString();
        const now = dayjs().valueOf();
        const apikey = {
            pk,
            sk,
            ...input,
            secret,
            createdAt: now,
            updatedAt: now,
            gsi1pk: 'APIKEY',
            gsi2sk: pk,
            gsi2pk: `USER#${input.userId}`,
            gsi1sk: pk,
        };

        const result = await Repository.save(apikey);
        if (!result) throw new StdError('Failed to create api key', 'create-failed', 500);
        return apikey;
    }

    static async findApiKeys() {
        const [data] = await Repository.query({
            IndexName: 'GSI1',
            KeyConditionExpression: 'gsi1pk = :pk',
            ExpressionAttributeValues: marshall({ ':pk': `APIKEY` }),
        });

        return data;
    }

    static async findUserApiKeys(userId: string) {
        const pk = `USER#${userId}`;

        const [data] = await Repository.query({
            IndexName: 'GSI2',
            KeyConditionExpression: 'gsi2pk = :pk and begins_with(gsi2sk, :sk)',
            ExpressionAttributeValues: marshall({ ':pk': pk, ':sk': `APIKEY#` }),
        });

        return data;
    }

    static async findApiKey(id: string) {
        const pk = `APIKEY#${id}`;
        const sk = pk;

        const result = await Repository.find(pk, sk);
        if (!result) throw new StdError('Api key not found', 'not-found', 404);
        return result;
    }

    static async updateApiKey(id: string, input: UpdateApiKeyInput) {
        const pk = `APIKEY#${id}`;
        const sk = pk;

        const apikey = await Repository.find(pk, sk);
        if (!apikey) throw new StdError('Api key not found', 'not-found', 404);

        Object.assign(apikey, Object.fromEntries(Object.entries(input).filter(([_, v]) => v !== undefined)));

        const result = await Repository.save(apikey);
        return plainToInstance(ApiKey, result, { excludeExtraneousValues: true });
    }

    static async deleteApiKey(id: string) {
        const pk = `APIKEY#${id}`;
        const sk = pk;

        const apikey = await Repository.find(pk, sk);
        if (!apikey) throw new StdError('Api key not found', 'not-found', 404);
        const ok = await Repository.delete(pk, sk);
        if (!ok) throw new StdError('Failed to delete api key', 'delete-failed', 500);

        return plainToInstance(ApiKey, apikey, { excludeExtraneousValues: true });
    }
}
