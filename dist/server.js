"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
// Routes
app.use('/api/auth', authRoutes_1.default);
// Connect MongoDB and start server
mongoose_1.default.connect(config_1.config.mongoURI)
    .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(config_1.config.port, () => {
        console.log(`🚀 Server running on http://localhost:${config_1.config.port}`);
    });
})
    .catch(err => {
    console.error('❌ MongoDB connection error:', err);
});
