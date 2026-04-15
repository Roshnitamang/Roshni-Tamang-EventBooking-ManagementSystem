import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: { type: String, required: false },
    googleId: { type: String, unique: true, sparse: true },


    verifyToken: { type: String, default: '' },
    verifyTokenExpireAt: { type: Number, default: 0 },
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
    },
    organizerStatus: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        default: 'none'
    },
    location: {
        type: String,
        default: ''
    },

    // eSewa Integration Fields
    esewaMerchantId: {
        type: String,
        default: ''
    },
    esewaSecretKey: {
        type: String,
        default: ''
    },
    esewaProductCode: {
        type: String,
        default: 'EPAYTEST'
    },

}, { timestamps: true });

const userModel = mongoose.models.User || mongoose.model('User', userSchema);

export default userModel;
