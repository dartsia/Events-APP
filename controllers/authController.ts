import { Request as Req, Response as Res } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../src/prismaClient';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error('ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET is not defined in .env');
}

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;

const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '10m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '1d';


export const handleRegister = async (req: Req, res: Res): Promise<void> => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400).json({ message: 'Username, email, and password are required.' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(409).json({ message: 'User already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword
      }
    });

    res.status(201).json({
      message: 'User registered successfully.',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
    return;

  } catch (err: any) {
    console.error('Registration error:', err.message);
    res.status(500).json({ message: 'Internal server error' });
    return;
  }
};

export const handleLogin = async (req: Req, res: Res): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const accessPayload = { id: user.id };
    const refreshPayload = { id: user.id, username: user.username };
    
    const accessToken = jwt.sign(
      accessPayload,
      ACCESS_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY } as SignOptions
    );
    
    const refreshToken = jwt.sign(
      refreshPayload,
      REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY } as SignOptions
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    });

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 10 * 60 * 1000
    });

    res.json({ accessToken });
    return;

  } catch (err: any) {
    console.error('Login error:', err.message);
    res.sendStatus(500);
    return;
  }
};

export const handleLogout = async (req: Req, res: Res): Promise<void> => {
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    res.sendStatus(204);
    return;
  }

  const refreshToken = cookies.jwt;

  try {
    const user = await prisma.user.findFirst({
      where: { refreshToken }
    });

    if (!user) {
      res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
      res.clearCookie('access_token', { httpOnly: true, sameSite: 'none', secure: true });
      res.sendStatus(204);
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: null }
    });

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
    res.clearCookie('access_token', { httpOnly: true, sameSite: 'none', secure: true })
    res.sendStatus(204);
    return;

  } catch (err: any) {
    console.error('Logout error:', err.message);
    res.sendStatus(500);
    return;
  }
};
