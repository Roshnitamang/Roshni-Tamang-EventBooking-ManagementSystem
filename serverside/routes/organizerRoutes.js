import express from 'express';
import { getDashboardStats, getEventBookings } from '../controllers/organizerController.js';
import { verifyToken, isOrganizer } from '../middleware/authMiddleware.js';

const organizerRouter = express.Router();

organizerRouter.get('/stats', verifyToken, isOrganizer, getDashboardStats);
organizerRouter.get('/event-bookings/:eventId', verifyToken, isOrganizer, getEventBookings);

export default organizerRouter;
