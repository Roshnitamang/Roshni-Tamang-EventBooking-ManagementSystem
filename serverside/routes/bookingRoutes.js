import express from 'express';
import { initiateEsewaPayment, verifyEsewaPayment, getUserBookings } from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

import upload from '../middleware/uploadMiddleware.js';

const bookingRouter = express.Router();

bookingRouter.post('/initiate-esewa', verifyToken, upload.single('image'), initiateEsewaPayment);
bookingRouter.get('/verify-esewa', verifyToken, verifyEsewaPayment);
bookingRouter.get('/my-bookings', verifyToken, getUserBookings);

export default bookingRouter;
