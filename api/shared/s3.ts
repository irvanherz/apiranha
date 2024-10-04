import { S3Client } from '@aws-sdk/client-s3';

export const client = new S3Client({
    requestHandler: {
        requestTimeout: 10000,
        httpsAgent: { maxSockets: 25 },
    },
});
