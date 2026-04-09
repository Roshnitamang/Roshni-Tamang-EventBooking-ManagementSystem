import express from 'express'
import { verifyToken } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { getUserData, requestOrganizerRole, submitKYC, updateUserProfile } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', verifyToken, getUserData);
userRouter.put('/update-profile', verifyToken, updateUserProfile);
userRouter.put('/request-organizer', verifyToken, requestOrganizerRole);

userRouter.post('/submit-kyc', verifyToken, upload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 }
]), submitKYC);

export default userRouter;