import express from 'express';
import eventController from '../controllers/eventsController';

const router = express.Router();

router.get('/events', eventController.getAllEvents);
router.post('/create-event', eventController.createEvent);
router.put('/update-event/:id', eventController.updateEvent);
router.delete('/delete-event/:id', eventController.deleteEvent);
router.get('/find-event', eventController.getSpecificEvent);
router.get('/my-events', eventController.showUserEvents);

export default router;