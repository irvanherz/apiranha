/* eslint-disable @typescript-eslint/no-inferrable-types */
import { IsEmail, Matches, MinLength } from 'class-validator';

export class CreateUserInput {
    @IsEmail()
    email: string;
    @Matches(/^[a-zA-Z0-9_]{3,}$/)
    username: string;
    @MinLength(6)
    password: string = '';
    @Matches(/^[A-Za-z\s]+$/)
    fullName: string = '';
}
