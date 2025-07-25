import { Router } from 'express';
import passport from 'passport';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// @desc    Auth with Google
// @route   GET /api/auth/google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// @desc    Google auth callback
// @route   GET /api/auth/google/callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to the frontend
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
  }
);

// @desc    Get current user
// @route   GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authenticated');
  }
  res.json(req.user);
});

// @desc    Logout user
// @route   GET /api/auth/logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

export default router;
