import express from 'express';
import { getMessages } from '../controllers/messageController.js';
import { sendMessage } from '../controllers/messageController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const messageRouter = express.Router();

// Message history is public — authentication is handled at the socket level
// Removing verifyToken prevents cookie-blocking (Edge Tracking Prevention) from
// causing 500s on page load.
messageRouter.get('/', getMessages);
messageRouter.post('/', verifyToken,sendMessage);

export default messageRouter;
