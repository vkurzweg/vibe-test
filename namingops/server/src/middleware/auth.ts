import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: 'submitter' | 'reviewer' | 'admin';
}

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

// Mock users - replace with database calls in production
const users: IUser[] = [
  {
    id: '1',
    email: 'submitter@example.com',
    name: 'John Submitter',
    role: 'submitter'
  },
  {
    id: '2',
    email: 'reviewer@example.com',
    name: 'Jane Reviewer',
    role: 'reviewer'
  },
  {
    id: '3',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin'
  }
];

// Passport OAuth2 Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      // In a real app, you would look up the user in your database
      const user = users.find(u => u.email === profile.emails?.[0].value);
      
      if (user) {
        return done(null, user);
      }
      
      // User not found - you might want to create a new user here
      return done(null, false, { message: 'User not found' });
    }
  ));
}

// Serialize/Deserialize user
passport.serializeUser((user: IUser, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  const user = users.find(u => u.id === id);
  done(null, user || null);
});

// Authentication middleware
export const protect = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // For API routes, return 401
  if (req.path.startsWith('/api')) {
    return next(new ApiError(401, 'Not authenticated'));
  }
  
  // For web routes, redirect to login
  res.redirect('/login');
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return next(new ApiError(401, 'Not authenticated'));
    }
    
    if (!req.user) {
      return next(new ApiError(401, 'User not found'));
    }
    
    const userRole = (req.user as IUser).role;
    
    if (!roles.includes(userRole)) {
      return next(
        new ApiError(403, `User role ${userRole} is not authorized to access this route`)
      );
    }
    
    next();
  };
};

export default passport;
