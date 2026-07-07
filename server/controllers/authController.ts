import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthRequest } from "../types";

// Helper to generate JWT
const generateToken = (id: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured on the server.");
  }
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "7d",
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).json({
      success: false,
      message: "An account with this email already exists.",
    });
    return;
  }

  // Create new user
  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      },
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Invalid user data provided.",
    });
  }
};

/**
 * @desc    Auth user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  if (user && (await user.comparePassword(password))) {
    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id.toString()),
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid email or password.",
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected)
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }

  res.status(200).json({
    success: true,
    data: req.user,
  });
};
