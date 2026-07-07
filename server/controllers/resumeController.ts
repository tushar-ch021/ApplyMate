import { Response } from "express";
import { AuthRequest } from "../types";
import { Session } from "../models/Session";
import { parseFileToText } from "../services/fileParserService";
import { generateResumePDF } from "../services/pdfGeneratorService";
import { generateResumeDOCX } from "../services/docxGeneratorService";

/**
 * @desc    Upload file & extract text to create session
 * @route   POST /api/resume/upload
 * @access  Private (Protected)
 */
export const uploadResumeFile = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: "Please upload a resume file." });
    return;
  }

  try {
    const rawText = await parseFileToText(req.file.buffer, req.file.mimetype);
    
    // Create new session
    const session = await Session.create({
      userId: req.user?._id,
      sessionName: req.file.originalname || "Uploaded Resume",
      originalResumeText: rawText,
      jobDescription: "",
      status: "draft",
    });

    res.status(201).json({
      success: true,
      data: {
        sessionId: session._id,
        sessionName: session.sessionName,
        text: rawText,
        charCount: rawText.length,
        wordCount: rawText.trim().split(/\s+/).length,
      },
    });
  } catch (error) {
    console.error("uploadResumeFile error:", error);
    res.status(422).json({
      success: false,
      message: `File parsing error: ${(error as Error).message}`,
    });
  }
};

/**
 * @desc    Paste resume text to create session
 * @route   POST /api/resume/paste
 * @access  Private (Protected)
 */
export const pasteResumeText = async (req: AuthRequest, res: Response): Promise<void> => {
  const { resumeText, sessionName } = req.body;

  if (!resumeText || resumeText.length < 100) {
    res.status(400).json({
      success: false,
      message: "Resume text must be at least 100 characters.",
    });
    return;
  }

  const session = await Session.create({
    userId: req.user?._id,
    sessionName: sessionName || "Pasted Resume",
    originalResumeText: resumeText,
    jobDescription: "",
    status: "draft",
  });

  res.status(201).json({
    success: true,
    data: {
      sessionId: session._id,
      sessionName: session.sessionName,
      text: resumeText,
    },
  });
};

/**
 * @desc    Get all sessions for user (limit 20)
 * @route   GET /api/resume/sessions
 * @access  Private (Protected)
 */
export const getUserSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  const sessions = await Session.find({ userId: req.user?._id })
    .sort({ updatedAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    count: sessions.length,
    data: sessions,
  });
};

/**
 * @desc    Get single session details
 * @route   GET /api/resume/sessions/:id
 * @access  Private (Protected)
 */
export const getSessionById = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await Session.findOne({
    _id: req.params.id,
    userId: req.user?._id,
  });

  if (!session) {
    res.status(404).json({
      success: false,
      message: "Session not found or unauthorized.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: session,
  });
};

/**
 * @desc    Delete a session
 * @route   DELETE /api/resume/sessions/:id
 * @access  Private (Protected)
 */
export const deleteSession = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await Session.findOneAndDelete({
    _id: req.params.id,
    userId: req.user?._id,
  });

  if (!session) {
    res.status(404).json({
      success: false,
      message: "Session not found or unauthorized.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Session deleted successfully.",
  });
};

/**
 * @desc    Save edited resume JSON structure
 * @route   PATCH /api/resume/sessions/:id/resume
 * @access  Private (Protected)
 */
export const saveEditedResume = async (req: AuthRequest, res: Response): Promise<void> => {
  const { resumeJson } = req.body;

  if (!resumeJson) {
    res.status(400).json({
      success: false,
      message: "Resume JSON is required.",
    });
    return;
  }

  const session = await Session.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?._id },
    {
      optimizedResume: resumeJson,
      status: "optimized",
    },
    { new: true }
  );

  if (!session) {
    res.status(404).json({
      success: false,
      message: "Session not found or unauthorized.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Resume saved successfully.",
    data: session,
  });
};

/**
 * @desc    Download PDF resume
 * @route   POST /api/resume/download/pdf
 * @access  Private (Protected)
 */
export const downloadPDF = async (req: AuthRequest, res: Response): Promise<void> => {
  const { resumeJson, theme } = req.body;

  if (!resumeJson) {
    res.status(400).json({ success: false, message: "Resume data is required." });
    return;
  }

  try {
    const pdfBuffer = await generateResumePDF(resumeJson, theme);
    const safeName = (resumeJson.name || "Resume").replace(/[^a-zA-Z0-9]/g, "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}_Resume.pdf"`);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation failed:", error);
    res.status(500).json({
      success: false,
      message: `PDF compilation failed: ${(error as Error).message}`,
    });
  }
};

/**
 * @desc    Download DOCX resume
 * @route   POST /api/resume/download/docx
 * @access  Private (Protected)
 */
export const downloadDOCX = async (req: AuthRequest, res: Response): Promise<void> => {
  const { resumeJson, theme } = req.body;

  if (!resumeJson) {
    res.status(400).json({ success: false, message: "Resume data is required." });
    return;
  }

  try {
    const docxBuffer = await generateResumeDOCX(resumeJson, theme);
    const safeName = (resumeJson.name || "Resume").replace(/[^a-zA-Z0-9]/g, "_");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}_Resume.docx"`);
    res.status(200).send(docxBuffer);
  } catch (error) {
    console.error("DOCX generation failed:", error);
    res.status(500).json({
      success: false,
      message: `DOCX compilation failed: ${(error as Error).message}`,
    });
  }
};

/**
 * @desc    Initialize a blank resume session (Build from Scratch)
 * @route   POST /api/resume/scratch
 * @access  Private (Protected)
 */
export const createSessionFromScratch = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionName } = req.body;

  const blankResume = {
    name: req.user?.name || "",
    contact: {
      email: req.user?.email || "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    summary: "",
    skills: {
      languages: [],
      frameworks: [],
      databases: [],
      tools: [],
      concepts: [],
    },
    experience: [],
    projects: [],
    education: [],
    certifications: [],
  };

  try {
    const session = await Session.create({
      userId: req.user?._id,
      sessionName: sessionName || "My Blank Resume",
      originalResumeText: "Built from scratch - blank start.",
      jobDescription: "",
      status: "optimized", // Immediately load workspace
      optimizedResume: blankResume,
    });

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("createSessionFromScratch error:", error);
    res.status(500).json({
      success: false,
      message: `Failed to create empty session: ${(error as Error).message}`,
    });
  }
};
