import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import User from '../models/User';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Unauthorized. No token.' });

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    req.userId = decoded.userId;

    // Fetch user data (without password)
    const user = await User.findById(decoded.userId).select('-password').lean();
    if (!user) return res.status(401).json({ message: 'User not found.' });

    // Attach full user data to req.user (optional)
    (req as any).user = user;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};
