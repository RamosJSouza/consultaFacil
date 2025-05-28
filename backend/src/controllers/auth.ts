import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { UserRole } from '../types';

interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    specialty?: string;
    licenseNumber?: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

export const register = async (req: RegisterRequest, res: Response): Promise<void> => {
  try {
    const { email, password, name, role, specialty, licenseNumber } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }

    // Validate role
    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Validate professional fields
    if (role === UserRole.PROFESSIONAL && (!specialty || !licenseNumber)) {
      res.status(400).json({ message: 'Professionals must provide specialty and license number' });
      return;
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role,
      specialty,
      licenseNumber,
      isActive: true,
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        specialty: user.specialty,
        licenseNumber: user.licenseNumber,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: LoginRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(403).json({ message: 'Account is deactivated' });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        specialty: user.specialty,
        licenseNumber: user.licenseNumber,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
