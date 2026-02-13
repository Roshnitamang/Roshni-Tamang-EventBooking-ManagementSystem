import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: { type: String, required: true },

    verifyOtp: { type: String, default: '' },
    verifyOtpExpireAt: { type: Number, default: 0 },
    isAccountVerified: { type: Boolean, default: false },

    resetOtp: { type: String, default: '' },
    resetOtpExpireAt: { type: Number, default: 0 },

    role: {
        type: String,
        enum: ['user', 'organizer', 'admin', 'super-admin'],
        default: 'user'
    },

    // 🔴 FIX: organizer approval must default to false
    isApproved: {
        type: Boolean,
        default: false
    },

    isOrganizerRequested: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
