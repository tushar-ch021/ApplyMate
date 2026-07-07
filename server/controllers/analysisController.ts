import { Response } from "express";
import { AuthRequest } from "../types";
import { Session } from "../models/Session";
import * as geminiService from "../services/geminiService";

/**
 * Helper to get active session and verify ownership
 */
const getVerifiedSession = async (sessionId: string, userId: any): Promise<any> => {
  if (!sessionId) {
    throw new Error("Session ID is required.");
  }
  const session = await Session.findOne({ _id: sessionId, userId });
  if (!session) {
    throw new Error("Session not found or unauthorized access.");
  }
  return session;
};

/**
 * @desc    Get ATS Score & Full report
 * @route   POST /api/analysis/ats
 * @access  Private (Protected)
 */
export const runATSAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId, jobDescription } = req.body;

  try {
    const session = await getVerifiedSession(sessionId, req.user?._id);

    if (!jobDescription || jobDescription.length < 100) {
      res.status(400).json({
        success: false,
        message: "Job description must be at least 100 characters.",
      });
      return;
    }

    // Run ATS analysis via Gemini service
    const analysisResult = await geminiService.analyzeATS(
      session.originalResumeText,
      jobDescription
    );

    // Save back to session database
    session.jobDescription = jobDescription;
    session.atsAnalysis = analysisResult;
    session.status = "analyzed";
    await session.save();

    res.status(200).json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    console.error("runATSAnalysis error:", error);
    res.status(503).json({
      success: false,
      message: "AI service temporarily unavailable, please retry.",
    });
  }
};

/**
 * @desc    AI Resume Content Optimizer
 * @route   POST /api/analysis/optimize
 * @access  Private (Protected)
 */
export const runResumeOptimizer = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId } = req.body;

  try {
    const session = await getVerifiedSession(sessionId, req.user?._id);

    if (!session.jobDescription) {
      res.status(400).json({
        success: false,
        message: "Please perform an ATS Analysis with a job description first.",
      });
      return;
    }

    // Call optimization
    const optimizationResult = await geminiService.optimizeResume(
      session.originalResumeText,
      session.jobDescription
    );

    // Update session structure
    session.optimizedResume = optimizationResult.optimizedResume;
    session.status = "optimized";
    await session.save();

    res.status(200).json({
      success: true,
      data: optimizationResult,
    });
  } catch (error) {
    console.error("runResumeOptimizer error:", error);
    res.status(503).json({
      success: false,
      message: "AI service temporarily unavailable, please retry.",
    });
  }
};

/**
 * @desc    Section-Specific AI Edit
 * @route   POST /api/analysis/edit-section
 * @access  Private (Protected)
 */
export const runSectionEdit = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sectionName, sectionContent, userPrompt, jobDescription } = req.body;

  if (!sectionName || typeof sectionContent !== "string" || !userPrompt) {
    res.status(400).json({
      success: false,
      message: "sectionName, sectionContent (as a string), and userPrompt are all required.",
    });
    return;
  }

  try {
    const rewriteResult = await geminiService.editSection(
      sectionName,
      sectionContent,
      userPrompt,
      jobDescription
    );

    res.status(200).json({
      success: true,
      data: rewriteResult,
    });
  } catch (error) {
    console.error("runSectionEdit error:", error);
    res.status(503).json({
      success: false,
      message: "AI service temporarily unavailable, please retry.",
    });
  }
};

/**
 * @desc    Standalone Keyword Gap Analyzer
 * @route   POST /api/analysis/keywords
 * @access  Private (Protected)
 */
export const runKeywordAnalyzer = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId } = req.body;

  try {
    const session = await getVerifiedSession(sessionId, req.user?._id);

    if (!session.jobDescription) {
      res.status(400).json({
        success: false,
        message: "Job description is missing. Perform an ATS analysis first.",
      });
      return;
    }

    const keywordResult = await geminiService.analyzeKeywords(
      session.originalResumeText,
      session.jobDescription
    );

    res.status(200).json({
      success: true,
      data: keywordResult,
    });
  } catch (error) {
    console.error("runKeywordAnalyzer error:", error);
    res.status(503).json({
      success: false,
      message: "AI service temporarily unavailable, please retry.",
    });
  }
};

/**
 * @desc    Generate tailored Cover Letter
 * @route   POST /api/analysis/cover-letter
 * @access  Private (Protected)
 */
export const runCoverLetterGenerator = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId, companyName, roleName, tone } = req.body;

  if (!companyName || !roleName || !tone) {
    res.status(400).json({
      success: false,
      message: "companyName, roleName, and tone are required inputs.",
    });
    return;
  }

  try {
    const session = await getVerifiedSession(sessionId, req.user?._id);

    const jd = session.jobDescription || "General job description alignment requested.";

    const coverLetterResult = await geminiService.generateCoverLetter(
      session.originalResumeText,
      jd,
      companyName,
      roleName,
      tone
    );

    // Save cover letter body to session
    session.coverLetter = coverLetterResult.coverLetter;
    await session.save();

    res.status(200).json({
      success: true,
      data: coverLetterResult,
    });
  } catch (error) {
    console.error("runCoverLetterGenerator error:", error);
    res.status(503).json({
      success: false,
      message: "AI service temporarily unavailable, please retry.",
    });
  }
};

/**
 * @desc    Generate Interview Prep coaching questions and STAR stories (and supports appending more questions)
 * @route   POST /api/analysis/interview-prep
 * @access  Private (Protected)
 */
export const runInterviewPrep = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId, generateMore } = req.body;

  try {
    const session = await getVerifiedSession(sessionId, req.user?._id);

    if (!session.jobDescription) {
      res.status(400).json({
        success: false,
        message: "Target job description is missing. Run ATS report first.",
      });
      return;
    }

    if (generateMore && session.interviewPrep) {
      const morePrep = await geminiService.prepareMoreInterview(
        session.originalResumeText,
        session.jobDescription,
        session.interviewPrep
      );

      // Merge results
      const current = session.interviewPrep || {};
      const updated = {
        technicalQuestions: [...(current.technicalQuestions || []), ...(morePrep.technicalQuestions || [])],
        behavioralQuestions: [...(current.behavioralQuestions || []), ...(morePrep.behavioralQuestions || [])],
        projectQuestions: [...(current.projectQuestions || []), ...(morePrep.projectQuestions || [])],
        questionsToAsk: Array.from(new Set([...(current.questionsToAsk || []), ...(morePrep.questionsToAsk || [])])),
        redFlags: Array.from(new Set([...(current.redFlags || []), ...(morePrep.redFlags || [])])),
      };

      session.interviewPrep = updated;
      session.markModified("interviewPrep");
      await session.save();

      res.status(200).json({
        success: true,
        data: updated,
      });
    } else {
      const prepResult = await geminiService.prepareInterview(
        session.originalResumeText,
        session.jobDescription
      );

      // Save prep questions back to session
      session.interviewPrep = prepResult;
      session.markModified("interviewPrep");
      await session.save();

      res.status(200).json({
        success: true,
        data: prepResult,
      });
    }
  } catch (error) {
    console.error("runInterviewPrep error:", error);
    res.status(503).json({
      success: false,
      message: `AI service error: ${(error as Error).message}`,
    });
  }
};

/**
 * @desc    Chat with AI for Interview Preparation
 * @route   POST /api/analysis/interview-prep/chat
 * @access  Private (Protected)
 */
export const runInterviewPrepChat = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId, message, chatHistory } = req.body;

  if (!sessionId || !message) {
    res.status(400).json({
      success: false,
      message: "sessionId and message are required fields.",
    });
    return;
  }

  try {
    const session = await getVerifiedSession(sessionId, req.user?._id);

    const coachResponse = await geminiService.chatInterviewPrep(
      session.originalResumeText,
      session.jobDescription || "No job description uploaded yet.",
      session.interviewPrep || {},
      message,
      chatHistory || []
    );

    res.status(200).json({
      success: true,
      data: {
        text: coachResponse,
      },
    });
  } catch (error) {
    console.error("runInterviewPrepChat error:", error);
    res.status(503).json({
      success: false,
      message: `AI service error: ${(error as Error).message}`,
    });
  }
};

/**
 * @desc    Chat with AI to modify styling, spacing, or content of the resume in real-time
 * @route   POST /api/analysis/resume/chat-edit
 * @access  Private (Protected)
 */
export const runResumeEditorChat = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId, message, chatHistory } = req.body;

  if (!sessionId || !message) {
    res.status(400).json({
      success: false,
      message: "sessionId and message are required fields.",
    });
    return;
  }

  try {
    const session = await getVerifiedSession(sessionId, req.user?._id);

    const currentResume = session.optimizedResume || {};

    const editResult = await geminiService.chatEditResume(
      currentResume,
      message,
      chatHistory || [],
      session.jobDescription
    );

    // Save the updated resume JSON to session and mark modified
    session.optimizedResume = editResult.updatedResume;
    session.status = "optimized";
    session.markModified("optimizedResume");
    await session.save();

    res.status(200).json({
      success: true,
      data: {
        assistantResponse: editResult.assistantResponse,
        updatedResume: editResult.updatedResume,
      },
    });
  } catch (error) {
    console.error("runResumeEditorChat error:", error);
    res.status(503).json({
      success: false,
      message: `AI service error: ${(error as Error).message}`,
    });
  }
};
