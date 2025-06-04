import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5001,
  mongoURI: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30m',
  jwtExpiresRemember: process.env.JWT_EXPIRES_REMEMBER_ME || '7d',
  cookieDomain: process.env.COOKIE_DOMAIN || '.localhost',
};
