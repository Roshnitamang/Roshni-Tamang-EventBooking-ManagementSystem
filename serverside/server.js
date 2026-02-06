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


const app = express();
const port = process.env.PORT || 4000
connectDB();

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173']

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use('/uploads', express.static('public/uploads'));

//endpoint api
app.get('/', (req, res) => res.send("API ok fine"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/events', eventRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/organizer', organizerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationRouter);

app.listen(port, () => console.log(`server start on PORT:${port}`));