import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
    heroImage: {
        type: String,
        default: '' // URL to the hero image
    },
    heroTitle: {
        type: String,
        default: 'Discover Amazing Events'
    },
    heroSubtitle: {
        type: String,
        default: 'Find and book the best local events happening around you.'
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure only one settings document exists
siteSettingsSchema.statics.getSettings = async function () {
    const settings = await this.findOne();
    if (settings) return settings;
    return await this.create({});
};

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;
