import Event from '../models/Event.js';

// Create Event
export const createEvent = async (req, res) => {
    try {
        const {
            title, summary, description, date, location, price,
            ticketsAvailable, category, image, ticketTypes,
            highlights, faqs
        } = req.body;

        // Basic validation
        if (!title || !date) {
            return res.json({ success: false, message: 'Title and Date are required' });
        }

        const newEvent = new Event({
            title,
            summary,
            description: description || 'No description',
            date,
            location: location || 'TBD',
            organizer: req.user.id,
            price: price || 0,
            ticketsAvailable: ticketsAvailable || 100,
            category: category || 'General',
            image: image || '',
            ticketTypes: ticketTypes || [],
            highlights: highlights || {},
            faqs: faqs || []
        });

        await newEvent.save();
        res.json({ success: true, message: 'Event created successfully', event: newEvent });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Recommended Events (AI Logic)
export const getRecommendedEvents = async (req, res) => {
    try {
        // Simple Recommendation: Fetch trending or random events for now
        // In a real "AI" scenario, we'd analyze req.user's past bookings
        const events = await Event.find({}).limit(5).sort({ createdAt: -1 });
        res.json({ success: true, events });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get All Events (with filters)
export const getAllEvents = async (req, res) => {
    try {
        const { search, category, date } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }
        if (date) {
            query.date = { $gte: new Date(date) };
        }

        const events = await Event.find(query)
            .populate('organizer', 'name email')
            .sort({ date: 1 });

        res.json({ success: true, events });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Single Event
export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name email');
        if (!event) {
            return res.json({ success: false, message: 'Event not found' });
        }
        res.json({ success: true, event });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Organizer's Events
export const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user.id });
        res.json({ success: true, events });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete Event
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.json({ success: false, message: 'Event not found' });
        }

        if (event.organizer.toString() !== req.user.id) {
            return res.json({ success: false, message: 'Not authorized to delete this event' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
