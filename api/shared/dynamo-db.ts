import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const client = new DynamoDBClient({
    requestHandler: {
        requestTimeout: 10000,
        httpsAgent: { maxSockets: 25 },
    },
});

export const dynamo = DynamoDBDocumentClient.from(client);
