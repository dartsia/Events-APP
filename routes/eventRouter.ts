import express from 'express';
import eventController from '../controllers/eventsController';
import verifyJWT from '../middleware/verifyJWT';

const router = express.Router();

router.get('/events', eventController.getAllEvents);
router.post('/create-event', verifyJWT, eventController.createEvent);
router.put('/update-event/:id', verifyJWT, eventController.updateEvent);
router.delete('/delete-event/:id', verifyJWT, eventController.deleteEvent);
router.get('/find-event', eventController.getSpecificEvent);
router.get('/my-events', verifyJWT, eventController.showUserEvents);

export default router;