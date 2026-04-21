import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { debugLog, errorLog } from "../config/debug.js";



export const verifyToken = async (req, res, next) => {
    console.log("Authorization header:", req.headers.authorization);
    console.log("Cookie token:", req.cookies?.token);

    let token;

    // Support BOTH cookie + header
    if (req.cookies?.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Session expired. Please login again.'
        });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_CODE);
        console.log("Decoded token:", tokenDecode);
        debugLog("Decoded Token", { id: tokenDecode?.id, role: tokenDecode?.role });

        if (!tokenDecode?.id) {
            console.log("Middleware verifyToken - No ID in decoded token");
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Login again'
            });
        }

        req.user = {
            id: tokenDecode.id,
            role: tokenDecode.role
        };

        // Attach to both for compatibility with existing controllers
        req.userId = tokenDecode.id;
        if (!req.body) req.body = {};
        req.body.userId = tokenDecode.id;
        next();
    } catch (error) {
        console.error("Middleware verifyToken - JWT Error:", error.message);
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user?.role === 'admin' || req.user?.role === 'super-admin') return next();
    return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.'
    });
};

export const isSuperAdmin = (req, res, next) => {
    if (req.user?.role === 'super-admin') return next();
    return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
    });
};

// 🔴 FIXED: organizer must be approved
export const isOrganizer = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const user = await User.findById(req.user.id);
        debugLog("isOrganizer user check", { id: user?._id, role: user?.role, isApproved: user?.isApproved });

        if (
            user &&
            (user.role === 'admin' ||
                (user.role === 'organizer' && user.isApproved))
        ) {
            return next();
        }

        debugLog("isOrganizer check failed", { userId: req.user.id });
        return res.status(403).json({
            success: false,
            message: 'Account pending admin approval or restricted access.'
        });
    } catch (error) {
        errorLog("isOrganizer Middleware Error", error);
        return res.status(500).json({ success: false, message: 'Internal Server Error in Authorization' });
    }
};

 
