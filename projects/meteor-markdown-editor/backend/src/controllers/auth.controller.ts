import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User, { IUser } from '../models/user.model';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(50)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const register = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: validatedData.email },
        { username: validatedData.username }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists with this email or username'
      });
    }
    
    // Create user with hashed password
    const user = new User({
      username: validatedData.username,
      email: validatedData.email,
      passwordHash: validatedData.password, // Will be hashed by pre-save hook
      displayName: validatedData.displayName,
      isVerified: false // Would require email verification in production
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
    
    // Return user data (excluding password) and token
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An error occurred during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);
    
    // Find user by email
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    // Compare passwords
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    
    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('Login error:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'An error occurred fetching user data' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const updateSchema = z.object({
      displayName: z.string().min(2).max(50).optional(),
      bio: z.string().max(500).optional(),
      website: z.string().url().optional().nullable(),
      socialLinks: z.object({
        twitter: z.string().optional().nullable(),
        github: z.string().optional().nullable(),
        linkedin: z.string().optional().nullable()
      }).optional()
    });
    
    const validatedData = updateSchema.parse(req.body);
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'An error occurred updating profile' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const passwordSchema = z.object({
      currentPassword: z.string(),
      newPassword: z.string().min(8)
    });
    
    const { currentPassword, newPassword } = passwordSchema.parse(req.body);
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    user.passwordHash = newPassword; // Will be hashed by pre-save hook
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    }
    
    console.error('Change password error:', error);
    res.status(500).json({ error: 'An error occurred changing password' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = z.object({
      email: z.string().email()
    }).parse(req.body);
    
    const user = await User.findOne({ email });
    if (!user) {
      // For security, still return success even if user not found
      return res.json({ message: 'If your email is in our system, you will receive a password reset link' });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();
    
    // In a real app, send email with reset link
    // For now, just return the token in the response
    res.json({
      message: 'If your email is in our system, you will receive a password reset link',
      // For development only - remove in production
      debug: { resetToken }
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'An error occurred processing your request' });
  }
};