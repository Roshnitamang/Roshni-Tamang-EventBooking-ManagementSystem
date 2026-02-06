import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    summary: { type: String }, // NEW: Short hook
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    price: { type: Number, required: true },
    ticketsAvailable: { type: Number, required: true },
    ticketTypes: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        limit: { type: Number, required: true },
        sold: { type: Number, default: 0 }
    }],
    highlights: { // NEW: Good to know section
        ageRestriction: { type: String, default: 'All ages allowed' },
        doorTime: { type: String },
        parking: { type: String, default: 'No parking info' }
    },
    faqs: [{ // NEW: Frequently asked questions
        question: { type: String },
        answer: { type: String }
    }],
    category: { type: String },
    image: { type: String },
    isApproved: { type: Boolean, default: true },
}, { timestamps: true });

const Event = mongoose.models.event || mongoose.model('event', eventSchema);

export default Event;
