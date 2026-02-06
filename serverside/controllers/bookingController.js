import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import { createNotification } from './notificationController.js';

// Create Booking
export const createBooking = async (req, res) => {
    try {
        const { eventId, tickets } = req.body;
        const userId = req.user.id;

        // Validation
        if (!eventId || !tickets || tickets < 1) {
            return res.json({ success: false, message: 'Invalid booking details' });
        }

        // Validate Booking Type Limits
        const type = req.body.bookingType || 'personal';
        if (type === 'personal' && tickets > 1) {
            return res.json({ success: false, message: 'Personal booking is limited to 1 ticket.' });
        }
        if (type === 'group' && tickets > 7) {
            return res.json({ success: false, message: 'Group booking is limited to 7 tickets.' });
        }

        // Check Event
        const event = await Event.findById(eventId);
        if (!event) {
            return res.json({ success: false, message: 'Event not found' });
        }

        // Check Availability
        if (event.ticketsAvailable < tickets) {
            return res.json({ success: false, message: 'Not enough tickets available' });
        }

        // Calculate Amount
        const totalAmount = event.price * tickets;

        // Create Booking
        const booking = new Booking({
            userId,
            eventId,
            tickets,
            totalAmount
        });

        // Deduct tickets from event
        event.ticketsAvailable -= tickets;

        await Promise.all([booking.save(), event.save()]);

        // Notify User
        await createNotification(userId, `Booking confirmed for ${event.title}!`, 'success');

        // Notify Organizer
        await createNotification(event.organizer, `New booking for ${event.title} (${tickets} tickets)`, 'info');

        res.json({ success: true, message: 'Booking successful', booking });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get User Bookings
export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('eventId', 'title date location price image')
            .sort({ createdAt: -1 });

        res.json({ success: true, bookings });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
