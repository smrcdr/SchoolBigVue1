import "express";

export interface JWTPayload {
    userId: number;
    role: string;
    name: string;
}

declare module "express-serve-static-core" {
    interface Request {
        user?: JWTPayload;
    }
}