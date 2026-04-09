import userModal from "../models/User.js";
import { createNotification } from "./notificationController.js";
import bcrypt from "bcryptjs";
import Event from "../models/Event.js";
import KYC from "../models/KYC.js";

export const getUserData = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModal.findById(userId).lean();

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const kyc = await KYC.findOne({ userId }).lean();

        res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
                role: user.role,
                isApproved: user.isApproved,
                isOrganizerRequested: user.isOrganizerRequested,
                location: user.location,
                organizerStatus: user.organizerStatus || 'none',
                kycDetails: kyc || null,
                esewaMerchantId: user.esewaMerchantId || '',
                esewaProductCode: user.esewaProductCode || 'EPAYTEST'
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, email, newPassword, location, esewaMerchantId, esewaSecretKey, esewaProductCode } = req.body;

        if (!name) {
            return res.json({ success: false, message: 'Name is required' });
        }

        const updateData = { name, location };

        if (email) {
            const existingUser = await userModal.findOne({ email });
            if (existingUser && existingUser._id.toString() !== userId) {
                return res.json({ success: false, message: 'Email already in use' });
            }

            const currentUser = await userModal.findById(userId);
            if (currentUser.email !== email) {
                updateData.email = email;
                updateData.isAccountVerified = false;
            }
        }

        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        if (esewaMerchantId !== undefined) updateData.esewaMerchantId = esewaMerchantId;
        if (esewaSecretKey !== undefined) updateData.esewaSecretKey = esewaSecretKey;
        if (esewaProductCode !== undefined) updateData.esewaProductCode = esewaProductCode;

        const user = await userModal.findByIdAndUpdate(userId, updateData, { new: true });

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (location) {
            try {
                const upcomingEvents = await Event.find({
                    date: { $gt: new Date() },
                    location: { $regex: location, $options: 'i' },
                    isApproved: true
                }).limit(5);

                for (const event of upcomingEvents) {
                    await createNotification(
                        userId,
                        `Great news! We found an event in ${location}: "${event.title}"`,
                        'info',
                        `/event/${event._id}`
                    );
                }
            } catch (err) {
                console.error("Error matching events for user location:", err);
            }
        }

        const kyc = await KYC.findOne({ userId }).lean();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            userData: {
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                isAccountVerified: user.isAccountVerified,
                isOrganizerRequested: user.isOrganizerRequested,
                location: user.location,
                organizerStatus: user.organizerStatus || 'none',
                kycDetails: kyc || null,
                esewaMerchantId: user.esewaMerchantId || '',
                esewaProductCode: user.esewaProductCode || 'EPAYTEST'
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const submitKYC = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            fullName, fatherName, motherName, grandfatherName,
            dob, gender, phoneNumber, occupation, country,
            permanentDistrict, permanentMunicipality, permanentWard, permanentVillageStreet,
            currentDistrict, currentMunicipality, currentWard, currentVillageStreet,
            idType, idNumber, issueDate, issueDistrict
        } = req.body;

        if (!req.files || !req.files['idFront'] || !req.files['idBack'] || !req.files['profilePhoto']) {
            return res.json({ success: false, message: 'Passport Photo, ID Front and Back images are required' });
        }

        const idFront = '/uploads/' + req.files['idFront'][0].filename;
        const idBack = '/uploads/' + req.files['idBack'][0].filename;
        const profilePhoto = '/uploads/' + req.files['profilePhoto'][0].filename;

        const existingKYC = await KYC.findOne({ userId });
        if (existingKYC && existingKYC.status === 'pending') {
            return res.json({ success: false, message: 'KYC already submitted and pending review' });
        }

        const kycData = {
            userId,
            fullName,
            fatherName,
            motherName,
            grandfatherName,
            dob,
            gender,
            phoneNumber,
            occupation,
            country,
            permanentAddress: {
                district: permanentDistrict,
                municipality: permanentMunicipality,
                ward: permanentWard,
                villageStreet: permanentVillageStreet
            },
            currentAddress: {
                district: currentDistrict,
                municipality: currentMunicipality,
                ward: currentWard,
                villageStreet: currentVillageStreet
            },
            idType,
            idNumber,
            issueDate,
            issueDistrict,
            profilePhoto,
            idFront,
            idBack,
            status: 'pending'
        };

        if (existingKYC) {
            await KYC.findByIdAndUpdate(existingKYC._id, kycData);
        } else {
            await KYC.create(kycData);
        }

        await userModal.findByIdAndUpdate(userId, { organizerStatus: 'pending', isOrganizerRequested: true });

        res.json({ success: true, message: 'KYC submitted successfully. Admin will review your request.' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const requestOrganizerRole = async (req, res) => {
    try {
        const userId = req.user.id;
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