import Booking from '../models/Booking.js';
import Event from '../models/Event.js';

// Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
    try {
        const organizerId = req.user.id;

        // Get all events by organizer
        const events = await Event.find({ organizer: organizerId });
        const eventIds = events.map(event => event._id);

        // Get bookings for these events
        const bookings = await Booking.find({ eventId: { $in: eventIds } });

        const totalEvents = events.length;
        const totalTicketsSold = bookings.reduce((sum, booking) => sum + booking.tickets, 0);
        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

        res.json({
            success: true,
            stats: {
                totalEvents,
                totalTicketsSold,
                totalRevenue
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Bookings for Specific Event
export const getEventBookings = async (req, res) => {
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
