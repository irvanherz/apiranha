import { Length } from 'class-validator';

export class UpdateApiKeyInput {
    @Length(1, 255)
    name: string;
}
