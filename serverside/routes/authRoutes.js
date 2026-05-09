import express from 'express'
import { isAuthenticated, login, logout, register, resetPassword, sendResetOtp, resendVerificationEmail, verifyEmail, googleLogin, verifyResetOtp } from '../controllers/authController.js';

import { verifyToken } from '../middleware/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/resend-verification-email', resendVerificationEmail);
authRouter.post('/verify-account', verifyEmail);
authRouter.get('/is-auth', isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/verify-reset-otp', verifyResetOtp);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/google-login', googleLogin);



export default authRouter;