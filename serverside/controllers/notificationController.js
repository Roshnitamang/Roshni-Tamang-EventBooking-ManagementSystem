import Notification from '../models/Notification.js';

// Get User Notifications
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Mark Notification as Read
export const markRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true, message: 'Marked as read' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Create Notification (Internal Helper)
export const createNotification = async (userId, message, type = 'info') => {
    try {
        await Notification.create({ userId, message, type });
    } catch (error) {
        console.error("Notification Error:", error);
    }
};
