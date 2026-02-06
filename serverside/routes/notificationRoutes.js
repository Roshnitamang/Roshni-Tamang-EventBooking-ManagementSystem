import express from 'express';
import { getNotifications, markRead } from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const notificationRouter = express.Router();

notificationRouter.get('/', verifyToken, getNotifications);
notificationRouter.put('/:id/read', verifyToken, markRead);

export default notificationRouter;
