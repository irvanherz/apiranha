import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { ErrorHandler } from '../shared/error-handler.decorator';
import { CreateApiKeyInput } from './dto/create-api-key.input';
import { UpdateApiKeyInput } from './dto/update-api-key.input';
import { ApiKeyService } from './service';

export class ApiKeyController {
    @ErrorHandler()
    static async createApiKey(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const input = plainToInstance(CreateApiKeyInput, JSON.parse(event.body || '{}'));
        await validateOrReject(input);
        const apikey = await ApiKeyService.createApiKey(input);
        return {
            statusCode: 200,
            body: JSON.stringify({ code: 'ok', message: 'ok', data: apikey }),
        };
    }

    @ErrorHandler()
    static async findApiKeys(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const data = await ApiKeyService.findApiKeys();
        return {
            statusCode: 200,
            body: JSON.stringify({ code: 'ok', message: 'ok', data }),
        };
    }

    @ErrorHandler()
    static async findUserApiKeys(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const userId = event.pathParameters?.id || '';
        const data = await ApiKeyService.findUserApiKeys(userId);
        return {
            statusCode: 200,
            body: JSON.stringify({ code: 'ok', message: 'ok', data }),
        };
    }
    @ErrorHandler()
    static async findApiKey(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const id = event.pathParameters?.id || '';
        const apikey = await ApiKeyService.findApiKey(id);
        return {
            statusCode: 200,
            body: JSON.stringify({ code: 'ok', message: 'ok', data: apikey }),
        };
    }
    @ErrorHandler()
    static async updateApiKey(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const id = event.pathParameters?.id || '';
        const input = plainToInstance(UpdateApiKeyInput, JSON.parse(event.body || '{}'));
        await validateOrReject(input);
        const apikey = await ApiKeyService.updateApiKey(id, input);
        return {
            statusCode: 200,
            body: JSON.stringify({ code: 'ok', message: 'ok', data: apikey }),
        };
    }
    @ErrorHandler()
    static async deleteApiKey(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const id = event.pathParameters?.id || '';
        const apikey = await ApiKeyService.deleteApiKey(id);
        return {
            statusCode: 200,
            body: JSON.stringify({ code: 'ok', message: 'ok', data: apikey }),
        };
    }
}
