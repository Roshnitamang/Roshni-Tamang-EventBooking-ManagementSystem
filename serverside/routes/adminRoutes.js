import express from 'express';
import { getSystemStats, getAllUsers, deleteUser, getAllEventsAdmin, approveEvent, deleteEventAdmin, getPendingOrganizers, approveOrganizer, demoteOrganizer, updateUserRole } from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const adminRouter = express.Router();

adminRouter.get('/stats', verifyToken, isAdmin, getSystemStats);
adminRouter.get('/users', verifyToken, isAdmin, getAllUsers);
adminRouter.delete('/users/:id', verifyToken, isAdmin, deleteUser);
adminRouter.get('/events', verifyToken, isAdmin, getAllEventsAdmin);
adminRouter.post('/approve-event', verifyToken, isAdmin, approveEvent);
adminRouter.delete('/events/:id', verifyToken, isAdmin, deleteEventAdmin);

// Organizer Approval
adminRouter.get('/organizers/pending', verifyToken, isAdmin, getPendingOrganizers);
adminRouter.put('/organizers/:id/approve', verifyToken, isAdmin, approveOrganizer);
adminRouter.put('/users/:id/demote', verifyToken, isAdmin, demoteOrganizer);
adminRouter.put('/users/:id/role', verifyToken, isAdmin, updateUserRole); // Protected inside controller check

export default adminRouter;
