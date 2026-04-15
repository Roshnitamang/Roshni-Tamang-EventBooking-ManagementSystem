import { Server } from "socket.io";
import { debugLog, errorLog } from "./config/debug.js";
import Message from "./models/Message.js";

export const initSocket = (server, allowedOrigins) => {
    const io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    const emitRoomCount = (room) => {
        const count = io.sockets.adapter.rooms.get(room)?.size || 0;
        io.to(room).emit("room_user_count", count);
    };

    io.on("connection", (socket) => {
        debugLog(`New client connected: ${socket.id}`);

        socket.on("join_room", (room) => {
            socket.join(room);
            debugLog(`Socket ${socket.id} joined room: ${room}`);
            emitRoomCount(room);
        });

        socket.on("send_message", async (data) => {
            const { room, userId, eventId, message, name, tempId } = data;

            if (!userId || !message?.trim()) {
                debugLog("send_message: missing userId or message, skipping.");
                return;
            }

            try {
                const newMessage = new Message({
                    userId,
                    eventId: eventId || null,
                    message: message.trim()
                });
                await newMessage.save();

                debugLog(`Message saved (${newMessage._id}) in room: ${room}`);

                io.to(room).emit("receive_message", {
                    _id: String(newMessage._id),   // always a string for client comparison
                    tempId: tempId || null,         // so optimistic message can be replaced
                    userId: String(userId),
                    eventId: newMessage.eventId ? String(newMessage.eventId) : null,
                    message: newMessage.message,
                    name,
                    room,                           // include room so clients can filter
                    createdAt: newMessage.createdAt
                });
            } catch (err) {
                errorLog("Error saving message", err);
                socket.emit("error", { message: "Failed to send message." });
            }
        });

        socket.on("typing", ({ room, name, userId }) => {
            if (!room || !userId) return;
            socket.to(room).emit("typing", { name, userId });
        });

        socket.on("stop_typing", ({ room, userId }) => {
            if (!room || !userId) return;
            socket.to(room).emit("stop_typing", { userId });
        });

        socket.on("disconnect", () => {
            debugLog(`Client disconnected: ${socket.id}`);
            // Update room counts for all rooms this socket was in
            socket.rooms.forEach((r) => {
                if (r !== socket.id) emitRoomCount(r);
            });
        });
    });

    return io;
};
