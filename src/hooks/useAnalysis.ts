import { useState } from "react";
import { aiAPI } from "../services/api";
import toast from "react-hot-toast";

export const useAnalysis = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const runATS = async (sessionId: string, jd: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiAPI.runATS(sessionId, jd);
      if (res.success) {
        toast.success("ATS Analysis completed!");
        return res.data;
      }
    } catch (err: any) {
      console.error("runATS error:", err);
      const msg = err.message || "Failed to run ATS analysis.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const runOptimizer = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiAPI.runOptimizer(sessionId);
      if (res.success) {
        toast.success("Resume optimized successfully!");
        return res.data;
      }
    } catch (err: any) {
      console.error("runOptimizer error:", err);
      const msg = err.message || "Failed to optimize resume.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const runKeywordAnalyzer = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiAPI.runKeywordAnalyzer(sessionId);
      if (res.success) {
        return res.data;
      }
    } catch (err: any) {
      console.error("runKeywordAnalyzer error:", err);
      setError(err.message || "Failed to run keyword analysis.");
    } finally {
      setLoading(false);
    }
    return null;
  };

  const runCoverLetter = async (
    sessionId: string,
    company: string,
    role: string,
    tone: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiAPI.runCoverLetter(sessionId, company, role, tone);
      if (res.success) {
        toast.success("Cover letter generated!");
        return res.data;
      }
    } catch (err: any) {
      console.error("runCoverLetter error:", err);
      const msg = err.message || "Failed to generate cover letter.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const runInterviewPrep = async (sessionId: string, generateMore?: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiAPI.runInterviewPrep(sessionId, generateMore);
      if (res.success) {
        toast.success(generateMore ? "More interview questions added!" : "Interview prep generated!");
        return res.data;
      }
    } catch (err: any) {
      console.error("runInterviewPrep error:", err);
      const msg = err.message || "Failed to generate interview prep details.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const runInterviewPrepChat = async (sessionId: string, message: string, chatHistory: any[]) => {
    try {
      const res = await aiAPI.runInterviewPrepChat(sessionId, message, chatHistory);
      if (res.success) {
        return res.data;
      }
    } catch (err: any) {
      console.error("runInterviewPrepChat error:", err);
      toast.error(err.message || "Failed to chat with interview coach.");
    }
    return null;
  };

  const runResumeChatEdit = async (sessionId: string, message: string, chatHistory: any[]) => {
    try {
      const res = await aiAPI.runResumeChatEdit(sessionId, message, chatHistory);
      if (res.success) {
        toast.success("Resume updated by Assistant!");
        return res.data;
      }
    } catch (err: any) {
      console.error("runResumeChatEdit error:", err);
      toast.error(err.message || "Failed to update resume.");
    }
    return null;
  };

  return {
    loading,
    error,
    runATS,
    runOptimizer,
    runKeywordAnalyzer,
    runCoverLetter,
    runInterviewPrep,
    runInterviewPrepChat,
    runResumeChatEdit,
  };
};

export default useAnalysis;
