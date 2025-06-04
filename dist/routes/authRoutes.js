"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register', authController_1.registerUser);
router.post('/login', authController_1.loginUser);
router.get('/verify', authController_1.verifyToken);
router.post('/logout', authController_1.logoutUser);
router.get('/profile', authMiddleware_1.protect, authController_1.getUserProfile); // Adjusted type casting
exports.default = router;
