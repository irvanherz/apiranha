import { Expose } from 'class-transformer';

export class ScreenshotResult {
    @Expose()
    id: string;
    @Expose()
    result: {
        url: string;
        width: number;
        height: number;
        format: string;
        expiredAt: Date;
    };
}
