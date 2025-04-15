import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../src/prismaClient';

const getUserByRefreshToken = async (refreshToken: string) => {
    const user = await prisma.user.findFirst({
        where: { refreshToken },
      });
    return user;      
};

export const handleRefreshToken = async (req: Request, res: Response): Promise<void> => {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
        res.sendStatus(401); // Unauthorized
        return;
    }

    const refreshToken = cookies.jwt;

    try {
        const foundUser = await getUserByRefreshToken(refreshToken);

        if (!foundUser) {
            res.sendStatus(403); // Forbidden
            return;
        }

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string,
            (err: any, decoded: any) => {
                if (err || typeof decoded !== 'object' || foundUser.username !== decoded.username) {
                    console.error('JWT verification error:', err);
                    return res.sendStatus(403); // Forbidden
                }

                const accessToken = jwt.sign(
                    {
                        id: foundUser.id,
                        username: foundUser.username                        
                    },
                    process.env.ACCESS_TOKEN_SECRET as string,
                    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
                );

                res.json({ accessToken });
            }
        );
    } catch (err: any) {
        console.error('Refresh token error:', err.message);
        res.sendStatus(500);
    }
};
