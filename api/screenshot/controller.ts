import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { plainToInstance } from 'class-transformer';
import { AuthorizeApiKey } from '../shared/authorize-api-key.decorator';
import { ErrorHandler } from '../shared/error-handler.decorator';
import { ScreenshotUrlInput } from './dto/screenshot-url.input';
import { ScreenshotService } from './service';

export class ScreenshotController {
    @ErrorHandler()
    @AuthorizeApiKey()
    static async screenshotUrl(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
        const input = plainToInstance(ScreenshotUrlInput, JSON.parse(event.body || '{}'));
        const result = await ScreenshotService.screenshotUrl(input);
        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    }
}
