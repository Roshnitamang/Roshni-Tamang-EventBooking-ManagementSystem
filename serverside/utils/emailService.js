import transporter from '../config/nodemailer.js';
import { debugLog } from '../config/debug.js';

/**
 * Send an email using the configured transporter
 * @param {Object} options - { to, subject, html }
 */
export const sendEmail = async ({ to, subject, html }) => {
    debugLog(`Email Service - Attempting send to: ${to}`, { subject });
    
    // Create a promise that rejects after a timeout
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email sending timed out')), 15000); // 15 second timeout
    });

    try {
        const mailOptions = {
            from: `"Planora" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html
        };

        // Race the email sending against the timeout
        const info = await Promise.race([
            transporter.sendMail(mailOptions),
            timeoutPromise
        ]);

        debugLog(`Email Service - Success: ${to}`, { response: info.response });
        return { success: true, info };
    } catch (error) {
        console.error(`Email Service Error for ${to}:`, error.message);
        debugLog(`Email Service - Failure: ${to}`, { error: error.message });
        return { success: false, error: error.message };
    }
};

