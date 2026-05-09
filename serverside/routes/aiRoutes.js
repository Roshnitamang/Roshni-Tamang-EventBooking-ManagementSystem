import express from 'express';
import { chatWithAI, getAISuggestions } from '../controllers/aiController.js';

const aiRouter = express.Router();

aiRouter.post('/chat', chatWithAI);
aiRouter.post('/suggestions', getAISuggestions);

export default aiRouter;
