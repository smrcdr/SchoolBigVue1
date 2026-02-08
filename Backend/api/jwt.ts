import jwt, {SignOptions} from "jsonwebtoken";
import {NextFunction, Request, Response} from "express";
import {JWTPayload} from "../types/express";
import "dotenv/config"
import crypto from "crypto";


export async function auth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No token" });

    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
        return res.status(401).json({ error: "Invalid header" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        next();
    } catch {
        return res.status(401).json({ error: "Unauthorized" });
    }
}

export async function decodeJWT(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header) {
        req.user = undefined;
        return next();
    }

    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
        req.user = undefined;
        return next();
    }

    try {
        req.user = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as JWTPayload;
    } catch {
        req.user = undefined;
    }

    next();

}

export function generateAccess(id: number, name: string, role: string, time: SignOptions["expiresIn"] = "15m") {

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }


    return jwt.sign(
        {
            userId: id,
            name: name,
            role: role
        },
        JWT_SECRET,
        { expiresIn: time }
    )
}

export function generateRefresh(id: number, time: SignOptions["expiresIn"] = "30d") {

    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

    if (!JWT_REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_SECRET is not defined");
    }

    return jwt.sign(
        {
            userId: id,
            tokenId: crypto.randomUUID()
        },
        JWT_REFRESH_SECRET,
        { expiresIn: time }
    )
}
