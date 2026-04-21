import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/mongodb.js'
import authRouter from './routes/authRoutes.js'
import userRouter from "./routes/userRoutes.js";
import eventRouter from "./routes/eventRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import organizerRouter from "./routes/organizerRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import siteSettingsRouter from "./routes/siteSettingsRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { debugLog, errorLog } from "./config/debug.js";
import http from "http";
import { initSocket } from "./socket.js";

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000
connectDB();

const rawClientUrl = (process.env.CLIENT_URL || '').trim();
const normalizedClientUrl = rawClientUrl.endsWith('/') ? rawClientUrl.slice(0, -1) : rawClientUrl;

const allowedOrigins = [
    normalizedClientUrl,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
].filter(origin => origin); // Filter out empty strings/undefined

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    debugLog(`Request: ${req.method} ${req.url}`);
    next();
});

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use('/uploads', express.static('public/uploads'));

// Initialize Socket.io
initSocket(server, allowedOrigins);

//endpoint api
app.get('/', (req, res) => res.send("API ok fine"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/events', eventRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/organizer', organizerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/settings', siteSettingsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/messages', messageRouter);

// Global Error Handler
app.use((err, req, res, next) => {
    errorLog("Global Error Catch", err);

    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: "File exceeds maximum size limit of 15MB"
        });
    }

    errorLog("Global Error Handler Caught", err);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

server.listen(port, () => {
    debugLog(`Server started on PORT: ${port}`);
});