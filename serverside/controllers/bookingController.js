import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import { createNotification } from './notificationController.js';

// Create Booking
export const createBooking = async (req, res) => {
    try {
        const { eventId, tickets, bookingType } = req.body;
        const userId = req.user.id;

        // Validation
        if (!eventId || !tickets || tickets < 1) {
            return res.json({ success: false, message: 'Invalid booking details' });
        }

        // Enforce New Ticket Selection Rules
        const ticketCount = Number(tickets);
        if (bookingType === 'single' && ticketCount !== 1) {
            return res.json({ success: false, message: 'Single ticket booking must have exactly 1 ticket.' });
        }
        if (bookingType === 'group' && (ticketCount < 2 || ticketCount > 6)) {
            return res.json({ success: false, message: 'Group booking must be between 2 and 6 tickets.' });
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

        // Group Photo handling
        let groupPhoto = '';
        if (bookingType === 'group' && req.file) {
            groupPhoto = `/uploads/${req.file.filename}`;
        } else if (bookingType === 'group' && !req.file) {
            return res.json({ success: false, message: 'Group photo is required for group bookings.' });
        }

        // Create Booking
        const booking = new Booking({
            userId,
            eventId,
            tickets,
            totalAmount,
            bookingType: bookingType || 'single',
            groupPhoto
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
