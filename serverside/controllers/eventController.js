import Event from '../models/Event.js';
import { debugLog, errorLog } from '../config/debug.js';

// Create Event
export const createEvent = async (req, res) => {
    debugLog("Create Event start", { body: req.body, file: req.file ? req.file.filename : null, user: req.user });
    try {
        const {
            title, summary, description, date, location, price,
            ticketsAvailable, category, image, ticketTypes,
            highlights, faqs, coordinates
        } = req.body;

        debugLog("Extracted fields", { title, date, location, price, ticketsAvailable });

        // Basic validation
        if (!title || !date || !location || !price || !ticketsAvailable) {
            return res.status(400).json({ success: false, message: 'All fields (Title, Date, Location, Price, Capacity) are required' });
        }

        const parseJSON = (str) => {
            try {
                return typeof str === 'string' ? JSON.parse(str) : str;
            } catch (e) {
                return str;
            }
        };

        const newEvent = new Event({
            title,
            summary,
            description: description || 'No description',
            date,
            location: location || 'TBD',
            coordinates: coordinates ? parseJSON(coordinates) : undefined,
            organizer: req.user.id,
            price: price || 0,
            ticketsAvailable: ticketsAvailable || 100,
            category: category || 'General',
            image: req.file ? `/uploads/${req.file.filename}` : (image || ''),
            ticketTypes: ticketTypes ? parseJSON(ticketTypes) : [],
            highlights: highlights ? parseJSON(highlights) : {},
            faqs: faqs ? parseJSON(faqs) : []
        });

        await newEvent.save();
        debugLog("Event saved successfully", { id: newEvent._id });
        res.json({ success: true, message: 'Event created successfully', event: newEvent });
    } catch (error) {
        errorLog("Create Event Controller Error", error);
        res.status(500).json({ success: false, message: error.message });
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
    console.log("GET Event request for ID:", req.params.id);
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name email');
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
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

// Get Events by Category
export const getEventsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const events = await Event.find({ category: { $regex: category, $options: 'i' } })
            .populate('organizer', 'name email')
            .sort({ date: 1 });

        res.json({ success: true, events });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get Events by Location (with radius in km)
export const getEventsByLocation = async (req, res) => {
    try {
        const { lat, lng, radius = 50 } = req.query; // radius in km, default 50km

        if (!lat || !lng) {
            return res.json({ success: false, message: 'Latitude and longitude are required' });
        }

        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusInKm = parseFloat(radius);

        // Find all events with coordinates
        const events = await Event.find({
            'coordinates.latitude': { $exists: true },
            'coordinates.longitude': { $exists: true }
        }).populate('organizer', 'name email');

        // Calculate distance and filter by radius
        const eventsWithDistance = events.map(event => {
            const eventLat = event.coordinates.latitude;
            const eventLng = event.coordinates.longitude;

            // Haversine formula to calculate distance
            const R = 6371; // Earth's radius in km
            const dLat = (eventLat - latitude) * Math.PI / 180;
            const dLng = (eventLng - longitude) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(latitude * Math.PI / 180) * Math.cos(eventLat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;

            return { ...event.toObject(), distance };
        }).filter(event => event.distance <= radiusInKm)
            .sort((a, b) => a.distance - b.distance);

        res.json({ success: true, events: eventsWithDistance });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
