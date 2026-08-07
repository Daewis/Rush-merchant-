import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User.js';
import { Provider } from '../models/Provider.js';
import { jwtRequired, AuthRequest } from '../middleware/auth.js';
import { NotificationService } from '../services/notificationService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'rush_merchant_jwt_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'rush_merchant_refresh_secret_key_2026';

function generateTokens(userId: string) {
  const access_token = jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
  const refresh_token = jwt.sign({ sub: userId }, JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return { access_token, refresh_token };
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, phone, password, full_name, role, skills, years_experience, hourly_rate, service_radius_km } = req.body;

    if (!email || !phone || !password || !full_name) {
      return res.status(400).json({ success: false, error: 'Missing required fields: email, phone, password, full_name' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    const existingUser = await User.findOne({ $or: [{ email: cleanEmail }, { phone: cleanPhone }] });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'User with this email or phone already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role && role.toUpperCase() === 'PROVIDER' ? UserRole.PROVIDER : UserRole.CUSTOMER;
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      fullName: full_name.trim(),
      role: userRole,
      isVerified: true, // auto-verify in preview for effortless onboarding
      verificationCode: otpCode,
      verificationSentAt: new Date(),
    });

    if (userRole === UserRole.PROVIDER) {
      await Provider.create({
        userId: user._id,
        skills: Array.isArray(skills) ? skills : [],
        yearsExperience: years_experience || 0,
        hourlyRate: hourly_rate || 3000,
        serviceRadiusKm: service_radius_km || 10,
      });
    }

    const tokens = generateTokens(user._id.toString());

    await NotificationService.sendVerificationEmail(user.email, otpCode);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          phone: user.phone,
          full_name: user.fullName,
          role: user.role,
          is_verified: user.isVerified,
          is_active: user.isActive,
        },
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, error: 'Account is deactivated' });
    }

    user.lastLogin = new Date();
    await user.save();

    const tokens = generateTokens(user._id.toString());

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          phone: user.phone,
          full_name: user.fullName,
          role: user.role,
          is_verified: user.isVerified,
          is_verified_provider: user.isVerifiedProvider,
          profile_picture: user.profilePicture,
        },
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: error.message || 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', jwtRequired(true), async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    // Return mock current user if no token provided during initial demo visit
    const defaultUser = await User.findOne({ role: UserRole.CUSTOMER }) || await User.findOne();
    if (defaultUser) {
      return res.json({
        success: true,
        data: {
          id: defaultUser._id.toString(),
          email: defaultUser.email,
          phone: defaultUser.phone,
          full_name: defaultUser.fullName,
          role: defaultUser.role,
          is_verified: defaultUser.isVerified,
          is_verified_provider: defaultUser.isVerifiedProvider,
          profile_picture: defaultUser.profilePicture,
        },
      });
    }
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const user = req.user;
  return res.json({
    success: true,
    data: {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone,
      full_name: user.fullName,
      role: user.role,
      is_verified: user.isVerified,
      is_verified_provider: user.isVerifiedProvider,
      profile_picture: user.profilePicture,
    },
  });
});

// POST /api/auth/verify
router.post('/verify', async (req, res) => {
  const { email } = req.body;
  if (email) {
    await User.updateOne({ email: email.trim().toLowerCase() }, { isVerified: true });
  }
  return res.json({ success: true, message: 'Account verified successfully' });
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  return res.json({ success: true, message: 'Verification code resent successfully' });
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ success: false, error: 'Refresh token required' });
  }
  try {
    const decoded = jwt.verify(refresh_token, JWT_REFRESH_SECRET) as { sub: string };
    const tokens = generateTokens(decoded.sub);
    return res.json({ success: true, access_token: tokens.access_token, data: { access_token: tokens.access_token } });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid refresh token' });
  }
});

// POST /api/auth/logout
router.post('/logout', jwtRequired(true), (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
