"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.verifyToken = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Shop_1 = __importDefault(require("../models/Shop"));
const config_1 = require("../config");
// 🔐 Generate JWT Token
const generateToken = (userId, remember) => {
    const options = {
        expiresIn: remember ? parseInt(config_1.config.jwtExpiresRemember) : parseInt(config_1.config.jwtExpiresIn),
    };
    return jsonwebtoken_1.default.sign({ userId }, config_1.config.jwtSecret, options);
};
// 📝 Register Controller
const registerUser = async (req, res) => {
    const { username, password, shops } = req.body;
    if (!username || !password || !Array.isArray(shops) || shops.length < 3) {
        return res.status(400).json({
            message: 'Username, password, and at least 3 shop names are required.',
        });
    }
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (password.length < 8 || !passwordRegex.test(password)) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters and include a number and special character.',
        });
    }
    try {
        const existingUser = await User_1.default.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists.' });
        }
        // Check globally unique shop names
        const existingShops = await Shop_1.default.find({ name: { $in: shops } });
        if (existingShops.length > 0) {
            const taken = existingShops.map((s) => s.name);
            return res.status(400).json({
                message: `These shop names are already taken: ${taken.join(', ')}`,
            });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await User_1.default.create({
            username,
            password: hashedPassword,
            shops,
        });
        // Save shops individually with error catching
        await Promise.all(shops.map(async (name) => {
            try {
                await Shop_1.default.create({ name, owner: newUser._id });
            }
            catch (err) {
                console.error(`Failed to create shop "${name}":`, err);
            }
        }));
        return res.status(201).json({ message: 'User registered successfully.' });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};
exports.registerUser = registerUser;
// 🔐 Login Controller
const loginUser = async (req, res) => {
    const { username, password, rememberMe } = req.body;
    try {
        const user = await User_1.default.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }
        const token = generateToken(user._id.toString(), rememberMe);
        // ✅ Fixed cookie settings (simplified for testing)
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            domain: '.ninesolution-client.vercel.app',
            maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 1 * 60 * 1000,
            path: '/',
        });
        // 🚨 CRITICAL: ADD THIS LINE TO SEND A RESPONSE
        res.status(200).json({ message: 'Login successful!', token, user: { id: user._id, username: user.username } });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};
exports.loginUser = loginUser;
const getUserProfile = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(404).json({ message: 'User not found.' });
        // Get shops owned by user
        const shops = await Shop_1.default.find({ owner: user._id }).select('name');
        res.json({
            username: user.username,
            shops: shops.map(shop => shop.name),
        });
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};
exports.getUserProfile = getUserProfile;
// 🔍 Verify Token Controller
const verifyToken = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided.' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        const user = await User_1.default.findById(decoded.userId).select('username email'); // expose only necessary fields
        if (!user) {
            return res.status(404).json({ success: false, token, message: 'User not found.' });
        }
        return res.status(200).json({
            success: true,
            user,
        });
    }
    catch (error) {
        console.error('Token verification failed:', error.message || error);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.',
        });
    }
};
exports.verifyToken = verifyToken;
// 🚪 Logout Controller
const logoutUser = (_req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        domain: config_1.config.cookieDomain,
        sameSite: 'lax',
    });
    res.status(200).json({ message: 'Logged out successfully.' });
};
exports.logoutUser = logoutUser;
