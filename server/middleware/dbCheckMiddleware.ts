import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

/**
 * Middleware to check if the database connection is healthy before executing routes.
 */
export const checkDbConnection = (req: Request, res: Response, next: NextFunction) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "Database connection is offline. Please configure your MONGODB_URI correctly in your environment variables/secrets panel and make sure your IP is whitelisted on MongoDB Atlas.",
    });
  }
  next();
};
