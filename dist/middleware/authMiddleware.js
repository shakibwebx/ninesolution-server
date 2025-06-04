"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({ message: 'Unauthorized. No token.' });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        req.userId = decoded.userId;
        // Fetch user data (without password)
        const user = await User_1.default.findById(decoded.userId).select('-password').lean();
        if (!user)
            return res.status(401).json({ message: 'User not found.' });
        // Attach full user data to req.user (optional)
        req.user = user;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid token.' });
    }
};
exports.protect = protect;
