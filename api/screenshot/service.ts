import { PutObjectCommand } from '@aws-sdk/client-s3';
import chromium from '@sparticuz/chromium';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import puppeteer from 'puppeteer-core';
import { client } from '../shared/s3';
import { StdError } from '../shared/std-error';
import { ScreenshotUrlInput } from './dto/screenshot-url.input';
import { ScreenshotResult } from './dto/screenshot.result';

export class ScreenshotService {
    static async screenshotUrl(input: ScreenshotUrlInput): Promise<ScreenshotResult> {
        let browser = null;
        const logs = [];
        try {
            logs.push({ type: 'init', timestamp: new Date().toISOString() });
            const userId = randomUUID().toString();
            const executablePath = await chromium.executablePath('/opt/nodejs/node_modules/@sparticuz/chromium/bin');
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath,
                headless: chromium.headless,
            });
            logs.push({ type: 'loading', timestamp: new Date().toISOString() });
            const page = await browser.newPage();
            await page.setViewport({ width: input.viewportWidth, height: input.viewportHeight });

            await page.goto(input.url, { waitUntil: 'networkidle0' });

            logs.push({ type: 'loaded', timestamp: new Date().toISOString() });
            const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 80 });
            const screenshotStream = Buffer.from(screenshotBuffer);
            logs.push({ type: 'loaded', timestamp: new Date().toISOString() });
            const resultId = randomUUID().toString();
            const expiredAt = dayjs().add(1, 'day').toDate();
            const uploadResult = await client.send(
                new PutObjectCommand({
                    Bucket: 'apiranha-screenshots',
                    Key: `USER-${userId}/${resultId}.jpg`,
                    Body: screenshotStream,
                    ContentType: 'image/jpeg',
                    Expires: expiredAt,
                }),
            );
            if (!uploadResult.$metadata.httpStatusCode || uploadResult.$metadata.httpStatusCode !== 200)
                throw new StdError('Failed to upload screenshot', 'upload-failed', 400);

            return plainToInstance(ScreenshotResult, {
                id: randomUUID().toString(),
                result: {
                    url: `https://apiranha-screenshots.s3.amazonaws.com/USER-${userId}/${resultId}.jpg`,
                    width: input.viewportWidth,
                    height: input.viewportHeight,
                    format: 'jpeg',
                    expiredAt,
                },
                logs,
            });
        } finally {
            if (browser !== null) {
                await browser.close();
            }
        }
    }
}
