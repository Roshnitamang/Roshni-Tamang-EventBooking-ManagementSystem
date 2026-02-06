import userModal from "../models/User.js";

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
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;

        if (!name) {
            return res.json({ success: false, message: 'Name is required' });
        }

        const user = await userModal.findByIdAndUpdate(userId, { name }, { new: true });

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

        res.json({ success: true, message: 'Role requested. Admin approval required.' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};