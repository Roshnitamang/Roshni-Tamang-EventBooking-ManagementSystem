import nodemailer from 'nodemailer'
import { debugLog } from './debug.js';

const smtpUser = (process.env.SMTP_USER || '').trim();
const smtpPass = (process.env.SMTP_PASS || '').trim();

debugLog("Creating Transporter with user:", { user: smtpUser, passLength: smtpPass.length });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: smtpUser,
        pass: smtpPass
    }
});

// Verify connection on startup
transporter.verify((error, success) => {
    if (error) {
        debugLog("SMTP Connection Error", error);
    } else {
        debugLog("SMTP Server is ready to take our messages");
    }
});

export default transporter;