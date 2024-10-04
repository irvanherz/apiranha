// import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Repository } from './repository';
import { StdError } from './std-error';

export function AuthorizeApiKey() {
    // This is the actual decorator function that wraps the method
    return function (target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
            const apikey = event.headers['x-api-key'];
            if (!apikey) throw new StdError('API key is required', 'unauthorized', 403);
            // Example: Assume the 'x-api-key' is Base64-encoded JSON user data
            const pk = `APIKEY#${apikey}`;
            const apikeyData = await Repository.find(pk, pk);
            if (!apikeyData) throw new StdError('Invalid API key', 'unauthorized', 403);
            const userId = apikeyData.userId;
            const user = await Repository.find(`USER#${userId}`, `USER#${userId}`);
            // Attach decoded user data to the event for further use
            event.requestContext.authorizer = {
                user,
            };
            // Call the original method with the modified event
            return await originalMethod.apply(this, [event]);
        };
    };
}
