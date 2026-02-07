import express from 'express';
import { getSiteSettings, updateSiteSettings } from '../controllers/siteSettingsController.js';
import upload from '../middleware/uploadMiddleware.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const siteSettingsRouter = express.Router();

siteSettingsRouter.get('/', getSiteSettings);

// Update settings, only for admins/super-admins. Allows image upload 'heroImage'
siteSettingsRouter.put('/update', verifyToken, isAdmin, upload.single('heroImage'), updateSiteSettings);

export default siteSettingsRouter;
