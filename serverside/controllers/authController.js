import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import userModal from "../models/User.js";
import transporter from "../config/nodemailer.js";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js'


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

        // Generate Verification Token
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const user = new userModal({
            name,
            email,
            password: hashedPassword,
            role: email === 'ghisingrosnee207@gmail.com' ? 'super-admin' : (email === 'nischayachamlingraii@gmail.com' ? 'admin' : (role || 'user')),
            isApproved,
            verifyToken: verificationToken,
            verifyTokenExpireAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        await user.save();

        // Send Verification Email
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&userId=${user._id}`;

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Verify your Account',
            html: EMAIL_VERIFY_TEMPLATE.replace("{{url}}", verificationUrl).replace("{{email}}", email)
        }
        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: "Registration successful. Please check your email to verify your account." });

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

        // Check if Account is Verified
        if (!user.isAccountVerified && user.email !== 'nischayachamlingraii@gmail.com' && user.email !== 'ghisingrosnee207@gmail.com') {
            return res.json({ success: false, message: 'Please verify your email first.' });
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
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 10 * 24 * 60 * 60 * 1000
        });

        return res.json({
            success: true,
            userData: {
                name: user.name,
                role: user.role,
                isApproved: user.isApproved,
                isAccountVerified: user.isAccountVerified,
                isOrganizerRequested: user.isOrganizerRequested
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
        const verificationToken = crypto.randomBytes(32).toString("hex");

        user.verifyToken = verificationToken;
        user.verifyTokenExpireAt = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

        await user.save();

        // Send Verification Email
        const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}&userId=${user._id}`;

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Verify your Account',
            html: EMAIL_VERIFY_TEMPLATE.replace("{{url}}", verificationUrl).replace("{{email}}", user.email)
        }

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'Verification email resent.' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    const { userId, token } = req.body;

    if (!userId || !token) {
        return res.json({ success: false, message: 'Missing Details' })
    }

    try {

        const user = await userModal.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not Found' });
        }

        if (user.isAccountVerified) {
            return res.json({ success: true, message: 'Email already verified' });
        }

        // Backdoor for Admin/Hardcoded User
        if (user.email === 'nischayachamlingraii@gmail.com') {
            // Allow verification
        } else if (user.verifyToken !== token) {
            return res.json({ success: false, message: 'Invalid Token' });
        }

        if (user.verifyTokenExpireAt < Date.now()) {
            return res.json({ success: false, message: 'Token Expired' });
        }

        user.isAccountVerified = true;
        user.verifyToken = '';
        user.verifyTokenExpireAt = 0;

        await user.save();
        return res.json({ success: true, message: 'Email verified successfully' });

    } catch (error) {
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
                name: user.name,
                role: user.role,
                isApproved: user.isApproved,
                isAccountVerified: user.isAccountVerified,
                isOrganizerRequested: user.isOrganizerRequested
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

        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password reset OPT',
            // text: `YOUR OTP IS ${otp} FOR CHANGING PASSWORD.`
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        }

        console.log("Attempting to send Reset OTP to:", user.email);
        const info = await transporter.sendMail(mailOptions);
        console.log("Reset OTP sent successfully:", info.response);

        return res.json({ success: true, message: 'OTP has been sent to your mail' });

    } catch (error) {
        console.error("Reset Password Email Error:", error);
        return res.json({ success: false, message: error.message })
    }
}


export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email,Otp,New passoword is reqried' })
    }
    try {
        const user = await userModal.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }
        // Backdoor for Admin/Hardcoded User
        if (user.email === 'nischayachamlingraii@gmail.com') {
            // Allow reset regardless of OTP provided
        } else if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'Otp expired' })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;
        await user.save();

        return res.json({ success: true, message: 'Password has been reset' });

    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}