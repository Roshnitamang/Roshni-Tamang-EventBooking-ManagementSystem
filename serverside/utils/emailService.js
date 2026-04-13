import transporter from '../config/nodemailer.js';
import { debugLog } from '../config/debug.js';

/**
 * Send an email using the configured transporter
 * @param {Object} options - { to, subject, html }
 */
export const sendEmail = async ({ to, subject, html }) => {
    debugLog(`Email Service - Attempting send to: ${to}`, { subject });
    try {
        const mailOptions = {
            from: `"Planora" <${process.env.SENDER_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        debugLog(`Email Service - Success: ${to}`, { response: info.response });
        return { success: true, info };
    } catch (error) {
        debugLog(`Email Service - Failure: ${to}`, { error: error.message });
        return { success: false, error: error.message };
    }
};

