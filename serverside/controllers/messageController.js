import Message from "../models/Message.js";
import User from "../models/User.js"; // Must be imported to register schema for populate()

export const getMessages = async (req, res) => {
    try {
        const { eventId } = req.query;
        let query = {};

        if (eventId && eventId !== 'null' && eventId !== 'undefined') {
            // Event-specific chat — cast to proper ObjectId string
            query.eventId = eventId;
        } else {
            // Global chat — in MongoDB, querying { eventId: null } matches
            // documents where eventId is null OR the field does not exist
            query.eventId = null;
        }

        const messages = await Message.find(query)
            .populate("userId", "name")
            .sort({ createdAt: 1 })
            .limit(100)
            .lean();

        res.json({
            success: true,
            messages: messages.map(msg => ({
                _id:       String(msg._id),
                userId:    msg.userId ? String(msg.userId._id) : null,
                name:      msg.userId?.name || "Deleted User",
                message:   msg.message,
                eventId:   msg.eventId ? String(msg.eventId) : null,
                createdAt: msg.createdAt
            }))
        });
    } catch (error) {
        console.error('[messageController] getMessages error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { message, eventId } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        const newMessage = new Message({
            message,
            userId: req.user ? req.user.id : null, // if auth exists
            eventId: eventId || null
        });

        await newMessage.save();

        const populatedMessage = await newMessage.populate("userId", "name");

        res.json({
            success: true,
            message: {
                _id: String(populatedMessage._id),
                userId: populatedMessage.userId?._id || null,
                name: populatedMessage.userId?.name || "Anonymous",
                message: populatedMessage.message,
                eventId: populatedMessage.eventId || null,
                createdAt: populatedMessage.createdAt
            }
        });

    } catch (error) {
        console.error('[messageController] sendMessage error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
