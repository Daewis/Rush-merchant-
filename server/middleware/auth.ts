import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'rush_merchant_jwt_secret_key_2026';

export const jwtRequired = (isOptional = true) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        if (isOptional) {
          return next();
        }
        return res.status(401).json({ success: false, error: 'Unauthorized: Missing or invalid token' });
      }

      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
        const user = await User.findById(decoded.sub);
        if (user && user.isActive) {
          req.user = user;
          req.userId = user._id.toString();
        }
      } catch (tokenErr) {
        // Token invalid or expired - allow through if optional
        if (!isOptional) {
          return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
        }
      }

      if (!req.user && !isOptional) {
        return res.status(401).json({ success: false, error: 'Unauthorized: User not found or deactivated' });
      }

      next();
    } catch (error) {
      if (isOptional) {
        return next();
      }
      return res.status(401).json({ success: false, error: 'Unauthorized: Auth processing error' });
    }
  };
};

export const customerRequired = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  next();
};

export const providerRequired = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  if (req.user.role !== UserRole.PROVIDER && !req.user.isVerifiedProvider) {
    return res.status(403).json({ success: false, error: 'Provider privileges required' });
  }
  next();
};

export const adminRequired = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ success: false, error: 'Admin privileges required' });
  }
  next();
};
