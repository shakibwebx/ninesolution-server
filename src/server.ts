import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from './config';
import authRoutes from './routes/authRoutes';

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());


app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow non-browser requests (e.g., curl, Postman)

    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://ninesolution-client.vercel.app',
    ];
    
    const isLocalhostSubdomain = /^https?:\/\/([a-z0-9-]+\.)*localhost(:\d+)?$/i.test(origin);
    const isVercelSubdomain = /^https:\/\/([a-z0-9-]+\.)*ninesolution-client\.vercel\.app$/i.test(origin);
    
    if (allowedOrigins.includes(origin) || isLocalhostSubdomain || isVercelSubdomain) {
      callback(null, true);
    } else {
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
app.use('/api/auth/', authRoutes);

// Connect MongoDB and start server
mongoose.connect(config.mongoURI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });
