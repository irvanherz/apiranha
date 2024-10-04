import {
    BatchGetItemCommand,
    BatchWriteItemCommand,
    DeleteItemCommand,
    GetItemCommand,
    PutItemCommand,
    QueryCommand,
    QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { marshall, NativeAttributeValue, unmarshall } from '@aws-sdk/util-dynamodb';
import { dynamo } from './dynamo-db';

export type RepositoryQueryInput = Omit<QueryCommandInput, 'TableName'>;
export type BatchFindEntry = { pk: string; sk: string };
export type BatchSaveEntry = Record<string, NativeAttributeValue>;

export class Repository {
    static async find<T = Record<string, NativeAttributeValue>>(pk: string, sk: string) {
        const result = await dynamo.send(
            new GetItemCommand({
                TableName: 'apiranha',
                Key: marshall({ pk, sk }),
            }),
        );
        if (!result.Item) return null;
        return unmarshall(result.Item) as T;
    }

    static async batchFind(...entries: BatchFindEntry[]) {
        const result = await dynamo.send(
            new BatchGetItemCommand({
                RequestItems: {
                    apiranha: {
                        Keys: entries.map((entry) => marshall(entry)),
                    },
                },
            }),
        );

        return result.Responses?.apiranha?.map((item) => unmarshall(item));
    }

    static async save<T>(item: T) {
        const result = await dynamo.send(
            new PutItemCommand({
                TableName: 'apiranha',
                Item: marshall(item),
            }),
        );
        if (result.$metadata.httpStatusCode !== 200) return null;
        return item;
    }

    static async batchSave(...entries: BatchSaveEntry[]) {
        const result = await dynamo.send(
            new BatchWriteItemCommand({
                RequestItems: {
                    apiranha: entries.map((entry) => ({ PutRequest: { Item: marshall(entry) } })),
                },
            }),
        );

        if (result.$metadata.httpStatusCode !== 200) return [[], entries] as [BatchSaveEntry[], BatchSaveEntry[]];
        const unprocessed = (result.UnprocessedItems?.apiranha || []).map((c) => unmarshall(c.PutRequest?.Item || {}));
        const processed = entries.filter((entry) => !unprocessed.find((u) => u.pk === entry.pk && u.sk === entry.sk));
        return [processed, unprocessed] as [BatchSaveEntry[], BatchSaveEntry[]];
    }

    static async query<T>(query: RepositoryQueryInput) {
        const result = await dynamo.send(
            new QueryCommand({
                ...query,
                TableName: 'apiranha',
            }),
        );
        if (!result.Items) return [];
        const data = result.Items.map((item) => unmarshall(item));
        const count = result.Count || 0;
        const lastEvaluatedKey = result.LastEvaluatedKey;
        return [data as T[], count, lastEvaluatedKey] as [T[], number, Record<string, NativeAttributeValue>];
    }

    static async delete(pk: string, sk: string) {
        const result = await dynamo.send(
            new DeleteItemCommand({
                TableName: 'apiranha',
                Key: marshall({ pk, sk }),
            }),
        );
        return result.$metadata.httpStatusCode === 200;
    }
}
