import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { upload } from "../middleware/uploadMiddleware";
import { asyncHandler } from "../utils/asyncHandler";
import {
  uploadResumeFile,
  pasteResumeText,
  getUserSessions,
  getSessionById,
  deleteSession,
  saveEditedResume,
  downloadPDF,
  downloadDOCX,
  createSessionFromScratch,
} from "../controllers/resumeController";

const router = Router();

// Apply protect middleware to all resume management endpoints
router.use(protect);

router.post("/upload", upload.single("file"), asyncHandler(uploadResumeFile));
router.post("/paste", asyncHandler(pasteResumeText));
router.post("/scratch", asyncHandler(createSessionFromScratch));
router.get("/sessions", asyncHandler(getUserSessions));
router.get("/sessions/:id", asyncHandler(getSessionById));
router.delete("/sessions/:id", asyncHandler(deleteSession));
router.patch("/sessions/:id/resume", asyncHandler(saveEditedResume));
router.post("/download/pdf", asyncHandler(downloadPDF));
router.post("/download/docx", asyncHandler(downloadDOCX));

export default router;
