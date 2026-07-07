import { Document, Types } from "mongoose";
import { Request } from "express";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  comparePassword(password: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession extends Document {
  userId: Types.ObjectId;
  sessionName: string;
  originalResumeText: string;
  jobDescription: string;
  atsAnalysis: any | null;
  optimizedResume: any | null;
  coverLetter: string | null;
  interviewPrep: any | null;
  status: "draft" | "analyzed" | "optimized";
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
}

