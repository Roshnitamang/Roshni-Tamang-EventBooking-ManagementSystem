import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import userModal from "../models/User.js";
import { sendEmail } from "../utils/emailService.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js'
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



//user register function
export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' })
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        return res.json({ success: false, message: 'Invalid Email Format' });
    }

    // Password strength check (at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.json({
            success: false,
            message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
        });
    }

    try {

        const existingUser = await userModal.findOne({ email })
        if (existingUser) {
            return res.json({ success: false, message: "user already exists" });
        }

        // Single Admin Check (Strict Email Policy)
        if (role === 'admin') {
            if (email !== 'nischayachamlingraii@gmail.com') {
                return res.json({ success: false, message: "Admin registration is restricted." });
            }

            const adminExists = await userModal.findOne({ role: 'admin' });
            if (adminExists) {
                return res.json({ success: false, message: "An Admin already exists." });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Organizer Approval Logic
        const isApproved = role === 'organizer' ? false : true;

        // Generate Verification OTP
        const verificationToken = String(Math.floor(100000 + Math.random() * 900000));

        const user = new userModal({
            name,
            email,
            password: hashedPassword,
            role: email === 'ghisingrosnee207@gmail.com' ? 'super-admin' : (email === 'nischayachamlingraii@gmail.com' ? 'admin' : (role || 'user')),
            isApproved,
            verifyToken: verificationToken,
            verifyTokenExpireAt: Date.now() + 60 * 1000,
            isAccountVerified: false
        });

        await user.save();
        console.log(`\n======================================================\n🚀 NEW USER REGISTERED: ${email} (OTP: ${verificationToken})\n======================================================\n`);

        // Send Verification Email
        const verificationUrl = `${process.env.CLIENT_URL}/email-verify?token=${verificationToken}&userId=${user._id}&email=${user.email}`;
        await sendEmail({
            to: user.email,
            subject: 'Verify your Account',
            html: EMAIL_VERIFY_TEMPLATE.replace("{{url}}", verificationUrl).replace("{{email}}", user.email).replace("{{otp}}", verificationToken)
        });

        return res.json({ success: true, message: "Registration successful. Please check your email for verification code." });

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}


//user login function
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Eamil and password are requred' })
    }

    try {
        const user = await userModal.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'invalid email' })
        }

        // Auto-Promote Super Admin / Admin if accidental User registration
        if (user.email === 'ghisingrosnee207@gmail.com' && user.role !== 'super-admin') {
            user.role = 'super-admin';
            user.isApproved = true;
            await user.save();
        } else if (user.email === 'nischayachamlingraii@gmail.com' && user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
        }

        if (user.role === 'organizer' && !user.isApproved) {
            return res.json({ success: false, message: 'Account pending admin approval.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({ success: false, message: 'invalid password' })
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_CODE, { expiresIn: '10d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 10 * 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            userData: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                isAccountVerified: user.isAccountVerified,
                isOrganizerRequested: user.isOrganizerRequested,
                location: user.location
            }
        });


    } catch (error) {
        return res.json({ success: false, message: error.message });
    }

}

//logout funcction
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        return res.json({ success: true, message: "loged out" })

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: "Email is required" });
        }

        const user = await userModal.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account is already verified" })
        }

        // Generate Verification Token
        const verificationToken = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyToken = verificationToken;
        user.verifyTokenExpireAt = Date.now() + 60 * 1000 // 60 seconds

        await user.save();
        console.log(`\n======================================================\n🚀 RESEND OTP FOR ${user.email}: ${verificationToken}\n======================================================\n`);

        // Send Verification Email
        const verificationUrl = `${process.env.CLIENT_URL}/email-verify?token=${verificationToken}&userId=${user._id}`;

        console.log("----------------------------------------------------------------");
        console.log("Attempting to send verification email (Resend)");
        console.log("URL:", verificationUrl);
        console.log("To:", user.email);

        await sendEmail({
            to: user.email,
            subject: 'Verify your Account',
            html: EMAIL_VERIFY_TEMPLATE.replace("{{url}}", verificationUrl).replace("{{email}}", user.email).replace("{{otp}}", verificationToken)
        });
        console.log("----------------------------------------------------------------");

        res.json({ success: true, message: 'Verification email resent.' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    const { userId, token, email } = req.body;

    if (!token) {
        return res.json({ success: false, message: 'Missing OTP Token' })
    }

    if (!userId && !email) {
        return res.json({ success: false, message: 'Missing User Details' })
    }

    try {
        debugLog("Verifying email request", { userId, email, token });
        let user;
        if (userId) {
            user = await userModal.findById(userId);
        } else {
            user = await userModal.findOne({ email });
        }

        if (!user) {
            debugLog("Verification failed: User not found", { email });
            return res.json({ success: false, message: 'User not Found' });
        }

        if (user.isAccountVerified) {
            return res.json({ success: true, message: 'Email already verified' });
        }

        // Backdoor for Admin/Hardcoded User
        if (user.email === 'nischayachamlingraii@gmail.com') {
            debugLog("Backdoor verification for admin", { email: user.email });
        } else if (user.verifyToken !== token) {
            debugLog("Verification failed: Invalid OTP", { expected: user.verifyToken, received: token });
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if (user.verifyTokenExpireAt < Date.now()) {
            debugLog("Verification failed: OTP Expired");
            return res.json({ success: false, message: 'OTP Expired' });
        }

        user.isAccountVerified = true;
        user.verifyToken = '';
        user.verifyTokenExpireAt = 0;

        await user.save();
        debugLog("Verification success", { email: user.email });
        return res.json({ success: true, message: 'Email verified successfully' });

    } catch (error) {
        errorLog("Verify Email Error", error);
        return res.json({ success: false, message: error.message });
    }

}

export const isAuthenticated = async (req, res) => {
    try {
        const { token } = req.cookies;
        console.log("Checking isAuthenticated. Cookie token found:", !!token);
        if (!token) {
            return res.json({ success: false, message: 'Not authorized' });
        }

        const tokenDecode = jwt.verify(token, process.env.JWT_CODE);
        console.log("Token decoded for ID:", tokenDecode?.id);
        if (!tokenDecode?.id) {
            return res.json({ success: false, message: 'Invalid token' });
        }

        const user = await userModal.findById(tokenDecode.id);
        if (!user) {
            console.log("isAuthenticated - User not found in DB for ID:", tokenDecode.id);
            return res.json({ success: false, message: 'User not found' });
        }

        return res.json({
            success: true,
            userData: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                isAccountVerified: user.isAccountVerified,
                isOrganizerRequested: user.isOrganizerRequested,
                location: user.location
            }
        });
    } catch (error) {
        console.log("Auth check error:", error.message);
        return res.json({ success: false, message: error.message });
    }
}

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: 'Email is required' })
    }

    try {
        const user = await userModal.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not Found' })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;

        user.resetOtpExpireAt = Date.now() + 60 * 1000 // 60 seconds

        await user.save();
        console.log(`\n======================================================\n🚀 RESET PASSWORD OTP FOR ${user.email}: ${otp}\n======================================================\n`);

        console.log("Attempting to send Reset OTP to:", user.email);
        await sendEmail({
            to: user.email,
            subject: 'Password reset OPT',
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        });

        return res.json({ success: true, message: 'OTP has been sent to your mail' });

    } catch (error) {
        console.error("Reset Password Email Error:", error);
        return res.json({ success: false, message: error.message })
    }
}


export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email, Otp, and New password are required' });
    }

    try {
        const user = await userModal.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        // Backdoor for Admin/Hardcoded User
        if (user.email === 'nischayachamlingraii@gmail.com') {
            // Allow reset
        } else if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP expired' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();

        return res.json({ success: true, message: 'Password has been reset' });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export const googleLogin = async (req, res) => {
    const { idToken } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, sub: googleId } = ticket.getPayload();

        let user = await userModal.findOne({ email });

        if (!user) {
            // Create new user if they don't exist
            user = new userModal({
                name,
                email,
                googleId,
                role: 'user', // Default as requested
                isAccountVerified: true, // Google emails are verified
                isApproved: true
            });
            await user.save();
        } else if (!user.googleId) {
            // Update existing user with googleId
            user.googleId = googleId;
            user.isAccountVerified = true;
            await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_CODE, { expiresIn: '10d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 10 * 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            userData: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                isAccountVerified: user.isAccountVerified,
                isOrganizerRequested: user.isOrganizerRequested,
                location: user.location
            }
        });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};