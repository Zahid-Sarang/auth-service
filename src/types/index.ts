import { Request } from "express";

export interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface RegisterUserRequest extends Request {
    body: UserData;
}

export type AuthCookie = {
    accessToken: string;
    refreshToken: string;
};

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
        id?: string;
    };
}

export interface IRefreshTokenPayload {
    id: string;
}
