import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'event', required: true },
    tickets: { type: Number, required: true, min: 1 },
    totalAmount: { type: Number, required: true },
    bookingType: { type: String, enum: ['single', 'group'], default: 'single' },
    groupPhoto: { type: String },
    status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' },
    paymentMethod: { type: String, enum: ['esewa', 'cash'], default: 'esewa' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    transactionId: { type: String }
}, { timestamps: true });

const Booking = mongoose.models.booking || mongoose.model('booking', bookingSchema);

export default Booking;
