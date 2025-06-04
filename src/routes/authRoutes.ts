import { RequestHandler, Router } from 'express';
import {
  registerUser,
  loginUser,
  verifyToken,
  logoutUser,
  getUserProfile,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.post('/register', registerUser as RequestHandler);
router.post('/login', loginUser as RequestHandler);
router.get('/verify', verifyToken as unknown as RequestHandler);
router.post('/logout', logoutUser as RequestHandler);
router.get('/profile', protect, getUserProfile as RequestHandler); // Adjusted type casting

export default router;
