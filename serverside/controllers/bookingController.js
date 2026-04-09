import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import userModal from '../models/User.js';
import { createNotification } from './notificationController.js';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

// Initiate eSewa Payment
export const initiateEsewaPayment = async (req, res) => {
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
        const transactionUuid = uuidv4();

        // eSewa Config from ENV
        const merchantId = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
        const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';

        // Group Photo handling
        let groupPhoto = '';
        if (bookingType === 'group' && req.file) {
            groupPhoto = `/uploads/${req.file.filename}`;
        } else if (bookingType === 'group' && !req.file) {
            return res.json({ success: false, message: 'Group photo is required for group bookings.' });
        }

        // Create pending Booking
        const booking = new Booking({
            userId,
            eventId,
            tickets,
            totalAmount,
            bookingType: bookingType || 'single',
            groupPhoto,
            status: 'booked',
            paymentMethod: 'esewa',
            paymentStatus: 'pending',
            transactionId: transactionUuid
        });

        await booking.save();

        // Generate eSewa Signature
        // Required fields for signature: total_amount,transaction_uuid,product_code
        const signatureMessage = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${merchantId}`;
        const signature = crypto.createHmac('sha256', secretKey).update(signatureMessage).digest('base64');

        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        const esewaData = {
            amount: totalAmount,
            tax_amount: 0,
            total_amount: totalAmount,
            transaction_uuid: transactionUuid,
            product_code: merchantId,
            product_service_charge: 0,
            product_delivery_charge: 0,
            success_url: `${frontendUrl}/payment-success`,
            failure_url: `${frontendUrl}/checkout/${eventId}?status=failure`,
            signed_field_names: 'total_amount,transaction_uuid,product_code',
            signature: signature,
            payment_url: process.env.ESEWA_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
        };

        res.json({ success: true, message: 'Payment initiated', esewaData, bookingId: booking._id });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Verify eSewa Payment
export const verifyEsewaPayment = async (req, res) => {
    try {
        const { data } = req.query;
        if (!data) return res.json({ success: false, message: 'No data provided' });

        // Decode base64 data
        const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
        const { transaction_uuid, status, total_amount, transaction_code, signature, signed_field_names } = decodedData;

        // Verify Signature
        const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
        const fields = signed_field_names.split(',');
        const signatureString = fields.map(field => `${field}=${decodedData[field]}`).join(',');
        const expectedSignature = crypto.createHmac('sha256', secretKey).update(signatureString).digest('base64');

        if (signature !== expectedSignature) {
            return res.json({ success: false, message: 'Invalid payment signature' });
        }

        if (status !== 'COMPLETE') {
            return res.json({ success: false, message: 'Payment failed' });
        }

        // Find booking
        const booking = await Booking.findOne({ transactionId: transaction_uuid });
        if (!booking) {
            return res.json({ success: false, message: 'Booking not found' });
        }

        if (booking.paymentStatus === 'completed') {
            return res.json({ success: true, message: 'Payment already verified', booking });
        }

        // Update booking status
        booking.paymentStatus = 'completed';

        // Deduct tickets from event
        const event = await Event.findById(booking.eventId);
        if (event) {
            event.ticketsAvailable -= booking.tickets;
            await event.save();

            // Notify User
            await createNotification(booking.userId, `Payment verified and booking confirmed for ${event.title}!`, 'success');

            // Notify Organizer
            await createNotification(event.organizer, `Payment received for ${booking.tickets} tickets to ${event.title}`, 'info');
        }

        await booking.save();

        res.json({ success: true, message: 'Payment verified and booking successful', booking });
    } catch (error) {
        console.error("eSewa verification error:", error);
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
