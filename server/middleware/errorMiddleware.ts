import { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
  statusCode?: number;
  code?: number; // For MongoDB duplicate keys
  keyValue?: any;
  errors?: any; // For Mongoose ValidationError
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 Error caught in middleware:", err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle specific MongoDB/Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Account with this ${field} already exists.`;
  }

  // Handle Mongoose validation errors
  if (err.name === "ValidationError" && err.errors) {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val: any) => val.message);
    message = messages.join(". ");
  }

  // Handle Mongoose cast errors
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Resource not found (invalid ID format).";
  }

  // Handle JWT signature / verification errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Not authorized. Token is invalid.";
  }

  // Handle JWT expiration errors
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Not authorized. Token has expired.";
  }

  // Handle Gemini AI specific errors (if flagged by our service)
  if (err.message && err.message.includes("Gemini API error")) {
    statusCode = 503;
    message = "AI service temporarily unavailable, please retry.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// Unknown route 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`,
  });
};
