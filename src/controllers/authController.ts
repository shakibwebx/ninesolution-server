import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import User from '../models/User';
import Shop from '../models/Shop';
import { config } from '../config';

// 🔐 Generate JWT Token
const generateToken = (userId: string, remember: boolean): string => {
  const options: SignOptions = {
    expiresIn: remember ? parseInt(config.jwtExpiresRemember) : parseInt(config.jwtExpiresIn),
  };

  return jwt.sign({ userId }, config.jwtSecret as string, options);
};

// 📝 Register Controller
export const registerUser = async (req: Request, res: Response) => {
  const { username, password, shops } = req.body;

  if (!username || !password || !Array.isArray(shops) || shops.length < 3) {
    return res.status(400).json({
      message: 'Username, password, and at least 3 shop names are required.',
    });
  }

  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;
  if (password.length < 8 || !passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        'Password must be at least 8 characters and include a number and special character.',
    });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    // Check globally unique shop names
    const existingShops = await Shop.find({ name: { $in: shops } });
    if (existingShops.length > 0) {
      const taken = existingShops.map((s) => s.name);
      return res.status(400).json({
        message: `These shop names are already taken: ${taken.join(', ')}`,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      shops,
    });

    // Save shops individually with error catching
    await Promise.all(
      shops.map(async (name) => {
        try {
          await Shop.create({ name, owner: newUser._id });
        } catch (err) {
          console.error(`Failed to create shop "${name}":`, err);
        }
      })
    );

    return res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// 🔐 Login Controller
export const loginUser = async (req: Request, res: Response) => {
  const { username, password, rememberMe } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const token = generateToken((user as { _id: string })._id.toString(), rememberMe);

    // ✅ Fixed cookie settings (simplified for testing)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',        // for cross-site cookies
      domain: '.ninesolution-client.vercel.app', // note the leading dot for subdomains
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000,
      path: '/',
    });
    

    // 🚨 CRITICAL: ADD THIS LINE TO SEND A RESPONSE
    res.status(200).json({ message: 'Login successful!', token, user: { id: user._id, username: user.username } });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};


export const getUserProfile = async (req: any, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Get shops owned by user
    const shops = await Shop.find({ owner: user._id }).select('name');

    res.json({
      username: user.username,
      shops: shops.map(shop => shop.name),
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// 🔍 Verify Token Controller
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }

    const decoded = jwt.verify(token, config.jwtSecret as string) as { userId: string };

    const user = await User.findById(decoded.userId).select('username email'); // expose only necessary fields
    if (!user) {
      return res.status(404).json({ success: false, token, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('Token verification failed:', error.message || error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
};


// 🚪 Logout Controller
export const logoutUser = (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    domain: config.cookieDomain,
    sameSite: 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully.' });
};
