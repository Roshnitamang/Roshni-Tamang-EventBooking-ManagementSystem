import nodemailer from 'nodemailer'
import { debugLog } from './debug.js';

const smtpUser = (process.env.SMTP_USER || '').trim();
const smtpPass = (process.env.SMTP_PASS || '').trim();

debugLog("Creating Transporter with user:", { user: smtpUser, passLength: smtpPass.length });

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    secure: (process.env.SMTP_PORT || 465) == 465, // true for 465, false for other ports
    pool: true, // Use connection pooling
    maxConnections: 5,
    maxMessages: 100,
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 30000, // 30 seconds
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