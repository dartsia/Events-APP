import express from 'express';
import { handleLogin, handleRegister, handleLogout } from '../controllers/authController';
import { body } from 'express-validator';

const router = express.Router();

router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  handleRegister
);

router.post('/login', handleLogin);

router.post('/logout', handleLogout);

export default router;