import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { ErrorHandler } from '../shared/error-handler.decorator';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UsersQueryInput } from './dto/users-query.input';
import { UserService } from './service';

export class UserController {
    @ErrorHandler()
    static async createUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const input = plainToInstance(CreateUserInput, JSON.parse(event.body || '{}'));
        await validateOrReject(input);
        const user = await UserService.createUser(input);
        return {
            statusCode: 200,
            body: JSON.stringify({ code: 'ok', message: 'ok', data: user }),
        };
    }

    @ErrorHandler()
    static async findUsers(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const query = plainToInstance(UsersQueryInput, event.queryStringParameters || {});
        const [data] = await UserService.findUsers(query);
        return {
            statusCode: 200,
            body: JSON.stringify({ code: 'ok', message: 'ok', data }),
        };
    }

    @ErrorHandler()
    static async findUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const userId = event.pathParameters?.id || '';
        if (!userId) throw new Error('User ID is required');
        const user = await UserService.findUser(userId);
        return {
            statusCode: 200,
            body: JSON.stringify({ code: 'ok', message: 'ok', data: user }),
        };
    }

    @ErrorHandler()
    static async updateUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const userId = event.pathParameters?.id || '';
        if (!userId) throw new Error('User ID is required');
        const input = plainToInstance(UpdateUserInput, JSON.parse(event.body || '{}'));
        await validateOrReject(input);
        const data = await UserService.updateUser(userId, input);
        return {
            statusCode: 200,
            body: JSON.stringify({
                code: 'ok',
                message: 'ok',
                data,
            }),
        };
    }

    @ErrorHandler()
    static async deleteUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const userId = event.pathParameters?.id || '';
        if (!userId) throw new Error('User ID is required');
        const user = await UserService.deleteUser(userId);
        return {
            statusCode: 200,
            body: JSON.stringify({ code: 'ok', message: 'ok', data: user }),
        };
    }
}
