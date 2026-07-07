import { Schema, model, Types } from "mongoose";
import { ISession } from "../types";

const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    sessionName: {
      type: String,
      default: "Untitled Session",
      trim: true,
    },
    originalResumeText: {
      type: String,
      required: [true, "Original resume text is required"],
    },
    jobDescription: {
      type: String,
      default: "",
    },
    atsAnalysis: {
      type: Schema.Types.Mixed,
      default: null,
    },
    optimizedResume: {
      type: Schema.Types.Mixed,
      default: null,
    },
    coverLetter: {
      type: String,
      default: null,
    },
    interviewPrep: {
      type: Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "analyzed", "optimized"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

export const Session = model<ISession>("Session", sessionSchema);
export default Session;
