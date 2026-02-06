import User from '../models/User.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';

// ===============================
// System Stats
// ===============================
export const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalEvents = await Event.countDocuments();
        const totalBookings = await Booking.countDocuments();

        const bookings = await Booking.find();
        const totalRevenue = bookings.reduce(
            (sum, booking) => sum + booking.totalAmount,
            0
        );

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalEvents,
                totalBookings,
                totalRevenue
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ===============================
// Users
// ===============================
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ===============================
// Events (Admin)
// ===============================
export const getAllEventsAdmin = async (req, res) => {
    try {
        const events = await Event.find({})
            .populate('organizer', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, events });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const approveEvent = async (req, res) => {
    try {
        const { eventId } = req.body;
        const event = await Event.findById(eventId);

        if (!event)
            return res.json({ success: false, message: 'Event not found' });

        event.isApproved = true;
        await event.save();

        res.json({ success: true, message: 'Event approved' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const deleteEventAdmin = async (req, res) => {
    try {
        await Event.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Event deleted by admin' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ===============================
// Organizer Approval (FIXED)
// ===============================
export const getPendingOrganizers = async (req, res) => {
    try {
        const organizers = await User.find({
            $or: [
                { isOrganizerRequested: true, isApproved: false },
                { role: 'organizer', isApproved: false }
            ]
        }).select('-password');

        res.json({ success: true, organizers });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const approveOrganizer = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, {
            role: 'organizer',
            isApproved: true,
            isOrganizerRequested: false
        });

        res.json({
            success: true,
            message: 'Organizer approved successfully'
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const demoteOrganizer = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, {
            role: 'user',
            isApproved: false,
            isOrganizerRequested: false
        });

        res.json({
            success: true,
            message: 'User demoted to standard user'
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const targetUser = await User.findById(req.params.id);

        if (!targetUser) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Prevent standard admins from promoting/demoting other admins
        if (req.user.role !== 'super-admin' && (targetUser.role === 'admin' || role === 'admin')) {
            return res.status(403).json({ success: false, message: 'Only Super Admin can manage admin roles' });
        }

        targetUser.role = role;
        if (role === 'admin' || role === 'super-admin') {
            targetUser.isApproved = true;
        }
        await targetUser.save();

        res.json({ success: true, message: `User role updated to ${role}` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
