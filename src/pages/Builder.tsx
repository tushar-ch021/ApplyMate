import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { useAnalysis } from "../hooks/useAnalysis";
import { aiAPI } from "../services/api";
import { getScoreColor } from "../utils/helpers";

// Sub-components & Sub-views
import ATSReport from "./ATSReport";
import ResumeOptimizer from "./ResumeOptimizer";
import CoverLetter from "./CoverLetter";
import InterviewPrep from "./InterviewPrep";
import KeywordBadges from "../components/KeywordBadges";
import LoadingSpinner from "../components/LoadingSpinner";

// Icons
import {
  Sparkles,
  FileText,
  Bookmark,
  ChevronLeft,
  Briefcase,
  AlertCircle,
  X,
  Check,
  RotateCw,
  Cpu,
  CornerDownRight,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import toast from "react-hot-toast";

type TabType = "ats" | "optimize" | "keywords" | "cover" | "prep";

export const Builder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  // Hook Managers
  const {
    currentSession,
    loading: sessionLoading,
    fetchSession,
    saveEditedResume,
    setCurrentSession,
  } = useSession();

  const {
    loading: aiLoading,
    runATS,
    runOptimizer,
    runKeywordAnalyzer,
    runCoverLetter,
    runInterviewPrep,
  } = useAnalysis();

  // Active workspace states
  const [activeTab, setActiveTab] = useState<TabType>("ats");
  const [localJd, setLocalJd] = useState<string>("");
  const [isJdModified, setIsJdModified] = useState<boolean>(false);
  const [maximizedElement, setMaximizedElement] = useState<string | null>(null);

  // Individual loading states
  const [isAtsRunning, setIsAtsRunning] = useState<boolean>(false);
  const [isOptimizeRunning, setIsOptimizeRunning] = useState<boolean>(false);
  const [isCoverRunning, setIsCoverRunning] = useState<boolean>(false);
  const [isPrepRunning, setIsPrepRunning] = useState<boolean>(false);

  // Standalone Keyword state
  const [keywordsData, setKeywordsData] = useState<any>(null);
  const [loadingKeywords, setLoadingKeywords] = useState<boolean>(false);

  // Section AI Rewrite Modal States (Feature 7)
  const [rewriteModalOpen, setRewriteModalOpen] = useState<boolean>(false);
  const [rewriteSectionName, setRewriteSectionName] = useState<string>("");
  const [rewriteOriginalContent, setRewriteOriginalContent] = useState<string>("");
  const [rewritePrompt, setRewritePrompt] = useState<string>("");
  const [rewriteOutput, setRewriteOutput] = useState<string>("");
  const [rewriteLoading, setRewriteLoading] = useState<boolean>(false);

  // Load session initially
  useEffect(() => {
    if (sessionId) {
      fetchSession(sessionId).then((data) => {
        if (data && data.jobDescription) {
          setLocalJd(data.jobDescription);
        }
      });
    } else {
      toast.error("Invalid workspace session reference.");
      navigate("/dashboard");
    }
  }, [sessionId, fetchSession, navigate]);

  // Sync keywords if analysis is completed
  useEffect(() => {
    if (currentSession?.atsAnalysis) {
      setKeywordsData({
        matched: currentSession.atsAnalysis.matchedKeywords || [],
        missing: currentSession.atsAnalysis.missingKeywords || [],
        weak: currentSession.atsAnalysis.weakKeywords || [],
      });
    }
  }, [currentSession]);

  // Prevent background body scroll when elements are maximized
  useEffect(() => {
    if (maximizedElement) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [maximizedElement]);

  const handleRunATS = async (targetJd: string) => {
    if (!sessionId) return;
    const desc = targetJd.trim() || localJd.trim();
    if (desc.length < 100) {
      toast.error("Please provide a realistic job description (minimum 100 characters).");
      return;
    }

    setIsAtsRunning(true);
    try {
      const res = await runATS(sessionId, desc);
      if (res) {
        // Reload session parameters
        await fetchSession(sessionId);
        setActiveTab("ats");
        setIsJdModified(false);
      }
    } finally {
      setIsAtsRunning(false);
    }
  };

  const handleRunOptimize = async () => {
    if (!sessionId) return;
    if (!currentSession.jobDescription) {
      toast.error("Please run the ATS Analysis first to set the target Job Description.");
      setActiveTab("ats");
      return;
    }

    setIsOptimizeRunning(true);
    try {
      const res = await runOptimizer(sessionId);
      if (res) {
        await fetchSession(sessionId);
        setActiveTab("optimize");
      }
    } finally {
      setIsOptimizeRunning(false);
    }
  };

  const handleRunKeywords = async () => {
    if (!sessionId) return;
    if (!currentSession.jobDescription) {
      toast.error("Run ATS analysis first to extract target technology keywords.");
      return;
    }

    setLoadingKeywords(true);
    try {
      const res = await runKeywordAnalyzer(sessionId);
      if (res) {
        setKeywordsData(res);
        toast.success("Keywords synchronized!");
      }
    } finally {
      setLoadingKeywords(false);
    }
  };

  const handleRunCoverLetter = async (company: string, role: string, tone: string) => {
    if (!sessionId) return;
    setIsCoverRunning(true);
    try {
      const res = await runCoverLetter(sessionId, company, role, tone);
      if (res) {
        await fetchSession(sessionId);
      }
    } finally {
      setIsCoverRunning(false);
    }
  };

  const handleRunInterviewPrep = async () => {
    if (!sessionId) return;
    setIsPrepRunning(true);
    try {
      const res = await runInterviewPrep(sessionId);
      if (res) {
        await fetchSession(sessionId);
      }
    } finally {
      setIsPrepRunning(false);
    }
  };

  const handleSaveResume = async (updatedJson: any) => {
    if (!sessionId) return;
    await saveEditedResume(sessionId, updatedJson);
  };

  const handleToggleMaximize = (element: string) => {
    setMaximizedElement((prev) => (prev === element ? null : element));
  };

  // Triggers open of Feature 7 Rewrite modal
  const handleOpenAIEdit = (sectionName: string, sectionContent: string) => {
    setRewriteSectionName(sectionName);
    setRewriteOriginalContent(sectionContent);
    setRewritePrompt("");
    setRewriteOutput("");
    setRewriteModalOpen(true);
  };

  const handleExecuteRewrite = async () => {
    if (!rewritePrompt.trim()) {
      toast.error("Please type instructions for the rewrite.");
      return;
    }

    setRewriteLoading(true);
    try {
      const res = await aiAPI.editSection(
        rewriteSectionName,
        rewriteOriginalContent,
        rewritePrompt,
        currentSession.jobDescription
      );

      if (res.success && res.data) {
        setRewriteOutput(res.data.rewrittenSection || res.data.rewrittenContent || "");
        toast.success("AI suggestion drafted!");
      }
    } catch (err: any) {
      console.error("Rewrite error:", err);
      toast.error("Failed to run edit-section request.");
    } finally {
      setRewriteLoading(false);
    }
  };

  const handleAcceptRewrite = async () => {
    if (!rewriteOutput.trim() || !currentSession?.optimizedResume) return;

    const copy = JSON.parse(JSON.stringify(currentSession.optimizedResume));

    // Map accepted string back to target schema field
    if (rewriteSectionName === "Professional Summary") {
      copy.summary = rewriteOutput.trim();
    } else if (rewriteSectionName === "Technical Skills") {
      try {
        // Replace skills JSON object
        copy.skills = JSON.parse(rewriteOutput.trim());
      } catch (e) {
        toast.error("Skills rewrite wasn't formatted as valid JSON. Reverting...");
        return;
      }
    } else if (rewriteSectionName === "Professional Experience") {
      try {
        copy.experience = JSON.parse(rewriteOutput.trim());
      } catch (e) {
        toast.error("Experience rewrite format error. Reverting...");
        return;
      }
    } else if (rewriteSectionName === "Key Projects") {
      try {
        copy.projects = JSON.parse(rewriteOutput.trim());
      } catch (e) {
        toast.error("Project rewrite format error. Reverting...");
        return;
      }
    } else {
      // General fallback paste
      toast.error("Failed to auto-merge section. Please copy/paste manually.");
      return;
    }

    // Update state and trigger save
    setCurrentSession((prev: any) => ({
      ...prev,
      optimizedResume: copy,
    }));
    await saveEditedResume(sessionId!, copy);
    setRewriteModalOpen(false);
  };

  if (sessionLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoadingSpinner text="Retrieving Session Records..." subtext="Syncing metadata and parsing historical outputs." />
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 max-w-md mx-auto space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold">Session loading failed</h3>
        <p className="text-xs text-gray-400">The session either does not exist or you lack authorization to open it.</p>
        <button onClick={() => navigate("/dashboard")} className="px-4 py-2 bg-blue-600 text-white rounded text-xs">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const score = currentSession.atsAnalysis?.atsScore || null;
  const scoreStyles = score !== null ? getScoreColor(score) : null;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-150 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-pointer"
            title="Back to Dashboard"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              {currentSession.sessionName}
            </h1>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">
              Workstation status: <span className="text-blue-500">{currentSession.status}</span>
            </p>
          </div>
        </div>

        {score !== null && scoreStyles && (
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-gray-400 font-medium">Active Match Score:</span>
            <div className={`px-3 py-1 rounded-full font-extrabold text-sm ${scoreStyles.bg} ${scoreStyles.text} border ${scoreStyles.border} ${scoreStyles.glow}`}>
              {score}% Match
            </div>
          </div>
        )}
      </div>

      {/* 2. Dual Panel Workspace layout (Desktop-first split: 40/60) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT PANEL: RESUME DISPLAY & PERSISTENT JD BOARD (40% width / 5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Target Job Description Console */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 dark:border-gray-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-blue-500" />
                Target Job Description
              </h3>
              {isJdModified && (
                <span className="text-[9px] text-amber-500 font-bold uppercase animate-pulse">
                  Modified
                </span>
              )}
            </div>

            <div className="space-y-3">
              <textarea
                rows={8}
                value={localJd}
                onChange={(e) => {
                  setLocalJd(e.target.value);
                  setIsJdModified(true);
                }}
                placeholder="Paste the target job description here..."
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 font-sans text-xs leading-relaxed text-gray-800 dark:text-gray-300"
              />
              {isJdModified && (
                <button
                  onClick={() => handleRunATS(localJd)}
                  disabled={aiLoading}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {aiLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  <span>Re-Compute ATS Match score</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick-Action Command Board */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Co-Pilot Command Station
            </h3>
            
            <div className="space-y-2">
              {/* Trigger Optimizer */}
              <button
                onClick={() => {
                  setActiveTab("optimize");
                  if (!currentSession.optimizedResume) handleRunOptimize();
                }}
                disabled={aiLoading}
                className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  activeTab === "optimize"
                    ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60"
                    : "bg-gray-50/40 dark:bg-gray-950/10 border-gray-100 dark:border-gray-800 hover:border-gray-200"
                }`}
              >
                <div className="p-2 rounded bg-blue-500 text-white shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold">Resume Optimizer Workspace</h4>
                  <p className="text-[10px] text-gray-400 leading-normal">Tailor work experience sentences & export PDF/DOCX.</p>
                </div>
              </button>

              {/* Trigger Cover Letter */}
              <button
                onClick={() => {
                  setActiveTab("cover");
                }}
                className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  activeTab === "cover"
                    ? "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/60"
                    : "bg-gray-50/40 dark:bg-gray-950/10 border-gray-100 dark:border-gray-800 hover:border-gray-200"
                }`}
              >
                <div className="p-2 rounded bg-purple-500 text-white shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold">Draft Tailored Cover Letter</h4>
                  <p className="text-[10px] text-gray-400 leading-normal">Generate cover letters in Professional, startup, or Concise tones.</p>
                </div>
              </button>

              {/* Trigger Interview Prep */}
              <button
                onClick={() => {
                  setActiveTab("prep");
                  if (!currentSession.interviewPrep) handleRunInterviewPrep();
                }}
                disabled={aiLoading}
                className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  activeTab === "prep"
                    ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60"
                    : "bg-gray-50/40 dark:bg-gray-950/10 border-gray-100 dark:border-gray-800 hover:border-gray-200"
                }`}
              >
                <div className="p-2 rounded bg-emerald-500 text-white shrink-0">
                  <Bookmark className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold">Interview Coaching & STAR stories</h4>
                  <p className="text-[10px] text-gray-400 leading-normal">Map technical questions and behavior scenarios from your timeline.</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: ACTION VIEW SHEETS WITH TABS (60% width / 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Workspace Tabs list */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 text-xs font-bold gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5">
            <button
              onClick={() => setActiveTab("ats")}
              className={`pb-3 border-b-2 px-1 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "ats"
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Cpu className="h-4 w-4" />
              ATS Audit Report
            </button>
            <button
              onClick={() => setActiveTab("optimize")}
              className={`pb-3 border-b-2 px-1 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "optimize"
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Optimized Workspace
            </button>
            <button
              onClick={() => {
                setActiveTab("keywords");
                if (!keywordsData) handleRunKeywords();
              }}
              className={`pb-3 border-b-2 px-1 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "keywords"
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              Keywords Match
            </button>
            <button
              onClick={() => setActiveTab("cover")}
              className={`pb-3 border-b-2 px-1 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "cover"
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              Cover Letter
            </button>
            <button
              onClick={() => setActiveTab("prep")}
              className={`pb-3 border-b-2 px-1 transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "prep"
                  ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Bookmark className="h-4 w-4" />
              Interview Prep
            </button>
          </div>

          {/* ACTIVE WORKSPACE CONTENTS */}
          <div className="space-y-6">
            <div className={
              maximizedElement === "ats"
                ? "fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 p-6 md:p-10 overflow-y-auto w-full h-full animate-fade-in"
                : activeTab === "ats" ? "" : "hidden"
            }>
              <ATSReport
                atsData={currentSession.atsAnalysis}
                onRunATS={handleRunATS}
                isRunning={isAtsRunning}
                savedJd={currentSession.jobDescription}
                isMaximized={maximizedElement === "ats"}
                onToggleMaximize={() => handleToggleMaximize("ats")}
              />
            </div>

            <div className={
              maximizedElement === "optimize" || maximizedElement === "chat" || maximizedElement === "resume-preview"
                ? "fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 md:p-8 overflow-hidden w-full h-full animate-fade-in flex flex-col"
                : activeTab === "optimize" ? "" : "hidden"
            }>
              <ResumeOptimizer
                sessionId={sessionId!}
                originalText={currentSession.originalResumeText}
                optimizedResume={currentSession.optimizedResume}
                onRunOptimize={handleRunOptimize}
                onSaveResume={handleSaveResume}
                onAIEdit={handleOpenAIEdit}
                isRunning={isOptimizeRunning}
                maximizedElement={maximizedElement}
                onToggleMaximize={handleToggleMaximize}
              />
            </div>

            <div className={
              maximizedElement === "keywords"
                ? "fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 p-6 md:p-10 overflow-y-auto w-full h-full animate-fade-in space-y-6"
                : activeTab === "keywords" ? "" : "hidden"
            }>
              {maximizedElement === "keywords" && (
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-500">Full Page View: Keywords Match & Gap Analysis</span>
                  <button
                    onClick={() => setMaximizedElement(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    <Minimize2 className="h-4 w-4" />
                    <span>Minimize</span>
                  </button>
                </div>
              )}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                      Keyword Gap Analysis
                    </h3>
                    <p className="text-[10px] text-gray-400">
                      We highlight vocabulary and technologies missing from your profile compared to target JD metrics.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunKeywords}
                      disabled={loadingKeywords}
                      className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white font-bold cursor-pointer transition-colors"
                    >
                      {loadingKeywords ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RotateCw className="h-3 w-3" />
                      )}
                      <span>Recalculate Gaps</span>
                    </button>
                    <button
                      onClick={() => handleToggleMaximize("keywords")}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white text-[10px] font-bold cursor-pointer transition-colors"
                      title={maximizedElement === "keywords" ? "Minimize" : "Maximize Full Page"}
                    >
                      {maximizedElement === "keywords" ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                      <span>{maximizedElement === "keywords" ? "Minimize" : "Maximize"}</span>
                    </button>
                  </div>
                </div>

                {loadingKeywords ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                  </div>
                ) : (
                  <KeywordBadges
                    matched={keywordsData?.matched}
                    missing={keywordsData?.missing}
                    weak={keywordsData?.weak}
                  />
                )}
              </div>
            </div>

            <div className={
              maximizedElement === "cover"
                ? "fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 p-6 md:p-10 overflow-y-auto w-full h-full animate-fade-in"
                : activeTab === "cover" ? "" : "hidden"
            }>
              <CoverLetter
                coverLetterText={currentSession.coverLetter}
                onGenerate={handleRunCoverLetter}
                isRunning={isCoverRunning}
                isMaximized={maximizedElement === "cover"}
                onToggleMaximize={() => handleToggleMaximize("cover")}
              />
            </div>

            <div className={
              maximizedElement === "prep" || maximizedElement === "prep-chat"
                ? "fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 p-6 md:p-10 overflow-y-auto w-full h-full animate-fade-in"
                : activeTab === "prep" ? "" : "hidden"
            }>
              <InterviewPrep
                prepData={currentSession.interviewPrep}
                onGenerate={handleRunInterviewPrep}
                isRunning={isPrepRunning}
                sessionId={sessionId || ""}
                isMaximized={maximizedElement === "prep"}
                onToggleMaximize={() => handleToggleMaximize("prep")}
                isChatMaximized={maximizedElement === "prep-chat"}
                onToggleMaximizeChat={() => handleToggleMaximize("prep-chat")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- FEATURE 7 SECTION-SPECIFIC REWRITE MODAL --- */}
      {rewriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-5 relative animate-scale-in">
            {/* Close Button */}
            <button
              onClick={() => setRewriteModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Header */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-pulse" />
                Section-Specific AI Edit
              </span>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Optimize "{rewriteSectionName}"
              </h3>
              <p className="text-[10px] text-gray-400 leading-normal">
                Type instructions to improve this segment (e.g. "Focus on senior architecture scope", "Translate verbs to passive format").
              </p>
            </div>

            {/* Split Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Left Panel: Original segment */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-semibold uppercase">Current Wording</label>
                <textarea
                  readOnly
                  rows={6}
                  value={
                    typeof rewriteOriginalContent === "object"
                      ? JSON.stringify(rewriteOriginalContent, null, 2)
                      : rewriteOriginalContent
                  }
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-lg focus:outline-none text-[10px] font-mono text-gray-400 select-all"
                />
              </div>

              {/* Right Panel: Rewritten output */}
              <div className="space-y-1.5">
                <label className="block text-gray-400 font-semibold uppercase">AI Suggested Rewrite</label>
                <textarea
                  rows={6}
                  value={rewriteOutput}
                  onChange={(e) => setRewriteOutput(e.target.value)}
                  placeholder="The optimized draft will compile here. Feel free to tweak and adjust it directly..."
                  className="w-full p-2.5 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 text-[10px] font-mono text-gray-800 dark:text-gray-300"
                />
              </div>
            </div>

            {/* Instruction input board */}
            <div className="space-y-2 text-xs">
              <label className="block text-gray-400 font-semibold uppercase">Your Instructions</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={rewritePrompt}
                  onChange={(e) => setRewritePrompt(e.target.value)}
                  placeholder="e.g. Add quantification using percentages and specify GCP architecture tools..."
                  className="flex-1 p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleExecuteRewrite();
                  }}
                />
                <button
                  onClick={handleExecuteRewrite}
                  disabled={rewriteLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs cursor-pointer disabled:opacity-50 flex items-center gap-1 shrink-0"
                >
                  {rewriteLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  <span>Rewrite</span>
                </button>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-50 dark:border-gray-800">
              <button
                onClick={() => setRewriteModalOpen(false)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptRewrite}
                disabled={!rewriteOutput.trim() || rewriteLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Accept Wording & Merge</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Builder;
