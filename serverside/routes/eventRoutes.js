import express from 'express';
import { createEvent, getAllEvents, getEventById, getMyEvents, deleteEvent, getRecommendedEvents } from '../controllers/eventController.js';
import { verifyToken, isOrganizer } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const eventRouter = express.Router();

eventRouter.post('/create', verifyToken, isOrganizer, upload.single('image'), createEvent);
eventRouter.get('/recommendations', getRecommendedEvents); // Public or Protected
eventRouter.get('/', getAllEvents); // Public access
eventRouter.get('/my-events', verifyToken, isOrganizer, getMyEvents);
eventRouter.get('/:id', getEventById); // Public access
eventRouter.delete('/:id', verifyToken, isOrganizer, deleteEvent);

export default eventRouter;
