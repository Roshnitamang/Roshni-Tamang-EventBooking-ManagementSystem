import express from 'express'
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, resendVerificationEmail, verifyEmail } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/resend-verification-email', resendVerificationEmail);
authRouter.post('/verify-account', verifyEmail);
authRouter.get('/is-auth', isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);


export default authRouter;