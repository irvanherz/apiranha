import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { JWT_SECRET } from '../shared/config';
import { ErrorHandler } from '../shared/error-handler.decorator';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';
import { AuthService } from './service';

export class AuthController {
    @ErrorHandler()
    static async login(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        console.log('aaaaa' + JWT_SECRET);
        const input = plainToInstance(LoginInput, JSON.parse(event.body || '{}'));
        await validateOrReject(input);
        const result = await AuthService.login(input);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    }

    @ErrorHandler()
    static async register(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const input = plainToInstance(RegisterInput, JSON.parse(event.body || '{}'));
        await validateOrReject(input);
        const result = await AuthService.register(input);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    }
}
