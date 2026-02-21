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

        // --- Data for Charts ---

        // 1. Revenue by Category
        const events = await Event.find();
        const categoryMap = {};
        events.forEach(event => {
            categoryMap[event.category] = (categoryMap[event.category] || 0) + 1;
        });
        const categoryStats = Object.keys(categoryMap).map(cat => ({
            name: cat,
            value: categoryMap[cat]
        }));

        // 2. Revenue Trend (Daily - Last 30 Days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentBookings = await Booking.find({
            createdAt: { $gte: thirtyDaysAgo }
        }).sort({ createdAt: 1 });

        const trendMap = {};
        recentBookings.forEach(booking => {
            const date = booking.createdAt.toISOString().split('T')[0];
            trendMap[date] = (trendMap[date] || 0) + booking.totalAmount;
        });

        const revenueTrend = Object.keys(trendMap).map(date => ({
            date,
            revenue: trendMap[date]
        }));

        // 3. Top Events by Revenue
        const eventRevenueMap = {};
        bookings.forEach(booking => {
            const eId = booking.eventId.toString();
            eventRevenueMap[eId] = (eventRevenueMap[eId] || 0) + booking.totalAmount;
        });

        const topEventsData = await Promise.all(
            Object.keys(eventRevenueMap)
                .sort((a, b) => eventRevenueMap[b] - eventRevenueMap[a])
                .slice(0, 5)
                .map(async (id) => {
                    const event = await Event.findById(id).select('title');
                    return {
                        name: event ? event.title : 'Deleted Event',
                        revenue: eventRevenueMap[id]
                    };
                })
        );

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalEvents,
                totalBookings,
                totalRevenue,
                categoryStats,
                revenueTrend,
                topEvents: topEventsData
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
        const { id } = req.params;
        const targetUser = await User.findById(id);

        if (!targetUser) {
            return res.json({ success: false, message: 'User not found' });
        }

        // --- Safeguards ---
        // 1. Prevent deleting Super Admin
        if (targetUser.role === 'super-admin') {
            return res.status(403).json({ success: false, message: 'Super Admin cannot be deleted' });
        }

        // 2. Only Super Admin can delete other Admins
        // Note: verifyToken middleware sets req.body.userId or similar, but isAdmin middleware usually ensures role
        // However, we rely on the role check from the Decoded Token usually. 
        // Checking if req.user exists (set by verifyToken)
        const requesterRole = req.user?.role;

        if (targetUser.role === 'admin' && requesterRole !== 'super-admin') {
            return res.status(403).json({ success: false, message: 'Only Super Admin can delete other Admins' });
        }

        // --- Cascading Deletion ---
        // 1. Delete all bookings associated with this user
        await Booking.deleteMany({ userId: id });

        // 2. Delete all events organized by this user
        await Event.deleteMany({ organizer: id });

        // 3. Permanently delete the user
        await User.findByIdAndDelete(id);

        res.json({ success: true, message: 'User and all related data deleted permanently' });
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

// Admin Event Bookings (Mirroring Organizer functionality but for Admin)
export const getEventBookingsAdmin = async (req, res) => {
    try {
        const { eventId } = req.params;
        const bookings = await Booking.find({ eventId })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, bookings });
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

export const rejectOrganizer = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, {
            isOrganizerRequested: false,
            isApproved: false
        });

        res.json({
            success: true,
            message: 'Organizer request rejected'
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

