import express from 'express';
import { createBooking, getUserBookings } from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

import upload from '../middleware/uploadMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.post('/book', verifyToken, upload.single('image'), createBooking);
bookingRouter.get('/my-bookings', verifyToken, getUserBookings);

export default bookingRouter;
