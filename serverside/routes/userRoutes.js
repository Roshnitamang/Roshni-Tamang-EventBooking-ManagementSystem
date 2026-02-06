import express from 'express'
import { verifyToken } from '../middleware/authMiddleware.js';
import { getUserData, requestOrganizerRole, updateUserProfile } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', verifyToken, getUserData);
userRouter.put('/update-profile', verifyToken, updateUserProfile);
userRouter.put('/request-organizer', verifyToken, requestOrganizerRole);

export default userRouter;