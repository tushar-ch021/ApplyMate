import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";
import { User } from "../models/User";

interface DecodedToken {
  id: string;
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token;

  // Check if authorization header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error("JWT_SECRET is not configured.");
        res.status(500).json({ success: false, message: "Server configuration error" });
        return;
      }

      // Verify token
      const decoded = jwt.verify(token, jwtSecret) as DecodedToken;

      // Get user from database, excluding password
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res.status(401).json({
          success: false,
          message: "User associated with this token no longer exists.",
        });
        return;
      }

      // Attach user object to request
      req.user = {
        _id: user._id as any,
        name: user.name,
        email: user.email,
      };

      next();
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401).json({
        success: false,
        message: "Not authorized. Token is invalid or expired.",
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: "Not authorized. No token provided.",
    });
  }
};
