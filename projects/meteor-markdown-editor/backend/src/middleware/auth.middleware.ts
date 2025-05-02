import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any; // Will be populated by auth middleware
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    const token = authHeader.split(' ')[1];
    const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Add user ID to request object for use in controller
    req.userId = decoded.userId;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Optional authentication middleware - won't reject if no token
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
      
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Add user ID to request object
      req.userId = decoded.userId;
    }
    
    next();
  } catch (error) {
    // Proceed even if token is invalid or not present
    next();
  }
};

// Admin authorization middleware
export const authorizeAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Normally we would look up the user and check isAdmin
    // For now, we'll just mock a check for a specific user ID
    const adminUserIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    if (!adminUserIds.includes(req.userId)) {
      return res.status(403).json({ error: 'Access denied. Admin permissions required.' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};