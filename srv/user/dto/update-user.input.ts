import { IsOptional, Matches, MinLength } from 'class-validator';

export class UpdateUserInput {
    @IsOptional()
    @Matches(/^[a-zA-Z0-9_]{3,}$/)
    username?: string;
    @IsOptional()
    @MinLength(6)
    password?: string;
    @IsOptional()
    @Matches(/^[A-Za-z\s]+$/)
    fullName?: string;
}
