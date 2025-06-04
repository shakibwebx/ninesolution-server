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
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true); // Allow non-browser requests (e.g., curl, Postman)
        const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://ninesolution-client.vercel.app/'];
        // Allow any subdomain of localhost (like shop.localhost:3000)
        const isSubdomainAllowed = /^https?:\/\/([a-z0-9-]+\.)*localhost(:\d+)?$/.test(origin);
        if (allowedOrigins.includes(origin) || isSubdomainAllowed) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
// 👋 Root Route — shown on visiting http://localhost:5001
app.get('/', (_req, res) => {
    res.send(`
    <h1>🚀 Welcome to the Auth API</h1>
    <p>Visit <code>/api/auth/register</code> to register</p>
    <p>Visit <code>/api/auth/login</code> to log in</p>
  `);
});
// Routes
app.use('/api/auth/', authRoutes_1.default);
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
