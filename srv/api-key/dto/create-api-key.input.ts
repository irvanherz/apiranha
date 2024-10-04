import { Length } from 'class-validator';

export class CreateApiKeyInput {
    userId: string;
    @Length(1, 255)
    name: string;
}
