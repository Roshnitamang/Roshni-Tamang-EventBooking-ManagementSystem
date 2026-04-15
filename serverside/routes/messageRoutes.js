import express from 'express';
import { getMessages } from '../controllers/messageController.js';

const messageRouter = express.Router();

// Message history is public — authentication is handled at the socket level
// Removing verifyToken prevents cookie-blocking (Edge Tracking Prevention) from
// causing 500s on page load.
messageRouter.get('/', getMessages);

export default messageRouter;
