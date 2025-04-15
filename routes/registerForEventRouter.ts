import express from 'express';
import registerController from '../controllers/registerForEventController';

const router = express.Router();

router.post('/register/:id', registerController.registerForEvent);

export default router;