import Event from '../models/Event.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';
import { createNotification } from './notificationController.js';
import { NEW_EVENT_TEMPLATE } from '../config/emailTemplates.js';
import { debugLog, errorLog } from '../config/debug.js';
import { getAIResponse } from '../utils/geminiService.js';
import Booking from '../models/Booking.js';
import jwt from 'jsonwebtoken';

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

        // Push Notifications to all users in background
        (async () => {
            try {
                const users = await User.find({}); // Notify ALL registered accounts
                debugLog(`Background Notifications - Found ${users.length} users to notify`);
                const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
                const eventLink = `${frontendUrl}/event/${newEvent._id}`;

                for (const user of users) {
                    const isNearby = user.location && newEvent.location.toLowerCase().includes(user.location.toLowerCase());
                    const alertType = isNearby ? "Nearby Alert" : "Global Alert";

                    // 1. Dashboard Notification
                    await createNotification(
                        user._id,
                        `${alertType}: ${newEvent.title} has been listed in ${newEvent.location}!`,
                        'info',
                        `/event/${newEvent._id}`
                    );

                    // 2. Email Notification
                    debugLog(`Attempting to send new event email to: ${user.email}`);
                    const emailResult = await sendEmail({
                        to: user.email,
                        subject: `${alertType}: ${newEvent.title} Discoveries`,
                        html: NEW_EVENT_TEMPLATE
                            .replace(/{{eventTitle}}/g, newEvent.title)
                            .replace(/{{location}}/g, newEvent.location)
                            .replace(/{{date}}/g, new Date(newEvent.date).toLocaleDateString())
                            .replace(/{{summary}}/g, newEvent.summary || 'New professional engagement available.')
                            .replace(/{{url}}/g, eventLink)
                    });
                    
                    if (!emailResult.success) {
                        debugLog(`Failed to send email to ${user.email}`, { error: emailResult.error });
                    }
                }
            } catch (err) {
                errorLog("Background Notification Error", err);
            }
        })();

        res.json({ success: true, message: 'Event created successfully', event: newEvent });
    } catch (error) {
        errorLog("Create Event Controller Error", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get Recommended Events (AI Logic)
export const getRecommendedEvents = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvents = await Event.find({ date: { $gte: today } }).limit(20);
        
        if (upcomingEvents.length === 0) {
            return res.json({ success: true, events: [], message: "No upcoming events found." });
        }

        let userId = null;
        let userBookings = [];
        const { token } = req.cookies;
        let userLocation = '';
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_CODE);
                userId = decoded.id;
                userBookings = await Booking.find({ userId }).populate('eventId').limit(10);
                const user = await User.findById(userId);
                if (user) userLocation = user.location || '';
            } catch (e) {
                // Ignore token errors
            }
        }

        const eventsContext = upcomingEvents.map(e => ({
            id: e._id,
            title: e.title,
            category: e.category,
            location: e.location,
            summary: e.summary
        }));

        const historyContext = userBookings.map(b => ({
            title: b.eventId?.title,
            category: b.eventId?.category
        })).filter(b => b.title);

        const systemInstruction = `You are a professional event recommendation assistant for Planora. Analyze upcoming events and user history to recommend the TOP 5 IDs. Return ONLY a JSON array.`;

        const userPrompt = `User Location: ${userLocation}\nUpcoming Events: ${JSON.stringify(eventsContext)}\nHistory: ${JSON.stringify(historyContext)}`;

        let recommendedIds = [];
        try {
            const aiResponse = await getAIResponse(systemInstruction, userPrompt);
            const jsonMatch = aiResponse.match(/\[.*\]/s);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (Array.isArray(parsed)) {
                    recommendedIds = parsed.filter(id => id && (typeof id === 'string' || typeof id === 'number'));
                }
            }
        } catch (error) {
            errorLog("AI Rec Failed", error);
            recommendedIds = upcomingEvents.slice(0, 5).map(e => e._id.toString());
        }

        const recommendedEvents = recommendedIds
            .map(id => upcomingEvents.find(e => e._id.toString() === id.toString()))
            .filter(e => e)
            .slice(0, 5);

        // Padding
        if (recommendedEvents.length < 5) {
            const currentIds = new Set(recommendedEvents.map(e => e._id.toString()));
            for (const event of upcomingEvents) {
                if (recommendedEvents.length >= 5) break;
                if (!currentIds.has(event._id.toString())) {
                    recommendedEvents.push(event);
                }
            }
        }

        return res.json({ success: true, events: recommendedEvents });
    } catch (error) {
        errorLog("getRecommendedEvents Final Fail", error);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get All Events (with filters)
export const getAllEvents = async (req, res) => {
    try {
        const { search, category, date, location } = req.query;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // ALWAYS filter by upcoming/today unless a specific date is requested (which must also be >= today)
        let query = { date: { $gte: today } };

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (category) {
            query.category = category;
        }
        if (date) {
            const requestedDate = new Date(date);
            // If requested date is in the past, or we just want to honor the requested date
            // but the requirement says "only upcoming and present should be shown".
            // So if they search for a past date, we probably should return empty or just >= today.
            query.date = { $gte: requestedDate < today ? today : requestedDate };
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const events = await Event.find({ 
            category: { $regex: category, $options: 'i' },
            date: { $gte: today }
        })
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

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find all UPCOMING events with coordinates
        const events = await Event.find({
            date: { $gte: today },
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
