import jwt, { SignOptions } from 'jsonwebtoken';
import path from 'path';
import dotenv from 'dotenv';
import { Request as Req, Response as Res, NextFunction as Next } from 'express';

// Extend the Request interface to include the 'user' property
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

dotenv.config({ path: path.resolve(__dirname, '../.env') });


const verifyJWT = (req: Req, res: Res, next: Next) : void => {
    const token = req.cookies?.access_token;
    if (!token) {
        res.sendStatus(401);
        return;
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err: any, decoded: any) => {
        if (err) return res.sendStatus(403);
        req.user = decoded;
        next();
    });
}

export default verifyJWT;