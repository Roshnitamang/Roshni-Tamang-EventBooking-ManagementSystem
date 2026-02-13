import userModal from "../models/User.js";
import { createNotification } from "./notificationController.js";

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModal.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
                role: user.role,
                isApproved: user.isApproved,
                isOrganizerRequested: user.isOrganizerRequested
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Update User Profile
import bcrypt from "bcryptjs";

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, newPassword } = req.body;

        if (!name) {
            return res.json({ success: false, message: 'Name is required' });
        }

        const updateData = { name };

        if (email) {
            const existingUser = await userModal.findOne({ email });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.json({ success: false, message: 'Email already in use' });
            }

            const currentUser = await userModal.findById(userId);
            if (currentUser.email !== email) {
                updateData.email = email;
                updateData.isAccountVerified = false; // Reset verification on email change
            }
        }

        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        const user = await userModal.findByIdAndUpdate(userId, updateData, { new: true });

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            userData: {
                name: user.name,
                email: user.email,
                role: user.role,
                isAccountVerified: user.isAccountVerified
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Request Organizer Role
export const requestOrganizerRole = async (req, res) => {
    try {
        const userId = req.user.id; // From verifyToken middleware
        const user = await userModal.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.role === 'organizer') {
            return res.json({ success: false, message: 'Already an organizer' });
        }

        if (user.role === 'admin') {
            return res.json({ success: false, message: 'Admins cannot become organizers' });
        }

        user.isOrganizerRequested = true;
        user.isApproved = false;
        await user.save();

        // Notify Admins
        const admins = await userModal.find({ role: { $in: ['admin', 'super-admin'] } });
        for (const admin of admins) {
            try {
                await createNotification(
                    admin._id,
                    `New organizer request from ${user.name}`,
                    'info'
                );
            } catch (err) {
                console.error(`Error notifying admin ${admin._id}:`, err);
            }
        }

        res.json({ success: true, message: 'Role requested. Admin approval required.' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};