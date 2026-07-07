import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  runATSAnalysis,
  runResumeOptimizer,
  runSectionEdit,
  runKeywordAnalyzer,
  runCoverLetterGenerator,
  runInterviewPrep,
  runInterviewPrepChat,
  runResumeEditorChat,
} from "../controllers/analysisController";

const router = Router();

// Protect all AI-powered analysis endpoints
router.use(protect);

router.post("/ats", asyncHandler(runATSAnalysis));
router.post("/optimize", asyncHandler(runResumeOptimizer));
router.post("/edit-section", asyncHandler(runSectionEdit));
router.post("/keywords", asyncHandler(runKeywordAnalyzer));
router.post("/cover-letter", asyncHandler(runCoverLetterGenerator));
router.post("/interview-prep", asyncHandler(runInterviewPrep));
router.post("/interview-prep/chat", asyncHandler(runInterviewPrepChat));
router.post("/resume/chat-edit", asyncHandler(runResumeEditorChat));

export default router;
