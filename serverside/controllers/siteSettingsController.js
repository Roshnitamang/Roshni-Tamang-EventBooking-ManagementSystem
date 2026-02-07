import SiteSettings from '../models/SiteSettings.js';
import fs from 'fs';
import path from 'path';

// Get current site settings
export const getSiteSettings = async (req, res) => {
    try {
        const settings = await SiteSettings.getSettings();
        res.json({ success: true, settings });
    } catch (error) {
        console.error("Error fetching site settings:", error);
        res.status(500).json({ success: false, message: "Failed to fetch settings" });
    }
};

// Update site settings (including hero image)
export const updateSiteSettings = async (req, res) => {
    try {
        const { heroTitle, heroSubtitle } = req.body;
        const settings = await SiteSettings.getSettings();

        if (heroTitle) settings.heroTitle = heroTitle;
        if (heroSubtitle) settings.heroSubtitle = heroSubtitle;

        // Handle Image Upload
        if (req.file) {
            // Delete old image if it exists and is not a default/external one
            if (settings.heroImage && settings.heroImage.startsWith('/uploads')) {
                const oldPath = path.join('public', settings.heroImage);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            // Save new image path
            settings.heroImage = `/uploads/${req.file.filename}`;
        }

        settings.lastUpdatedBy = req.userId;
        settings.updatedAt = Date.now();

        await settings.save();

        res.json({ success: true, message: "Site settings updated successfully", settings });
    } catch (error) {
        console.error("Error updating site settings:", error);
        res.status(500).json({ success: false, message: "Failed to update settings" });
    }
};
