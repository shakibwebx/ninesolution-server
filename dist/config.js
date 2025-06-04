"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 5001,
    mongoURI: process.env.MONGO_URI || '',
    jwtSecret: process.env.JWT_SECRET || 'secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30m',
    jwtExpiresRemember: process.env.JWT_EXPIRES_REMEMBER_ME || '7d',
    cookieDomain: process.env.COOKIE_DOMAIN || '.localhost',
};
