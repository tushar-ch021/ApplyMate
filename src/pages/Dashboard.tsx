import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSession } from "../hooks/useSession";
import { getScoreColor, formatDate } from "../utils/helpers";
import {
  FileUp,
  FileText,
  Plus,
  Trash2,
  ArrowRight,
  ClipboardList,
  UploadCloud,
  ChevronRight,
  Loader2,
  Calendar,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    sessions,
    loading: sessionsLoading,
    fetchSessions,
    createSessionFromPaste,
    createSessionFromScratch,
    createSessionFromUpload,
    deleteSession
  } = useSession();

  // Active method toggle: "upload" | "paste" | "scratch"
  const [method, setMethod] = useState<"upload" | "paste" | "scratch">("upload");
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>("");
  const [sessionTitle, setSessionTitle] = useState<string>("");
  const [scratchTitle, setScratchTitle] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  // Fetch past sessions on page load
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // File Dropzone Event Listeners
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        await processFile(file);
      }
    },
    []
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".pdf") && !file.name.endsWith(".docx")) {
      toast.error("Invalid file format. Please upload PDF or DOCX only.");
      return;
    }

    setUploading(true);
    try {
      const sessionData = await createSessionFromUpload(file);
      if (sessionData && sessionData._id) {
        navigate(`/builder?sessionId=${sessionData._id}`);
      }
    } catch (error) {
      console.error("File processing failed:", error);
    } finally {
      setUploading(false);
    }
  };

  // Plain Text Paste submission
  const handlePasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedText.trim() || pastedText.trim().length < 200) {
      toast.error("Resume content is too short. Please provide at least 200 characters.");
      return;
    }

    setUploading(true);
    try {
      const title = sessionTitle.trim() || "Pasted Resume Content";
      const sessionData = await createSessionFromPaste(pastedText, title);
      if (sessionData && sessionData._id) {
        navigate(`/builder?sessionId=${sessionData._id}`);
      }
    } catch (error) {
      console.error("Paste submission failed:", error);
    } finally {
      setUploading(false);
    }
  };

  // Build from scratch submission
  const handleScratchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scratchTitle.trim()) {
      toast.error("Please enter a title for your resume.");
      return;
    }

    setUploading(true);
    try {
      const sessionData = await createSessionFromScratch(scratchTitle.trim());
      if (sessionData && sessionData._id) {
        navigate(`/builder?sessionId=${sessionData._id}`);
      }
    } catch (error) {
      console.error("Scratch session creation failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "optimized":
        return "text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-950/30";
      case "analyzed":
        return "text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/30";
      case "parsed":
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/30";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Page Greeting Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white font-sans">
            Welcome back, {user?.name || "Job Seeker"}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 mt-1">
            Create a new ATS session or review your saved templates.
          </p>
        </div>
      </div>

      {/* 2. Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: UPLOAD / PASTE ENTRY FORM (7-columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white uppercase">
              Initialize New Session
            </h2>
            {/* Method Toggle */}
            <div className="flex flex-wrap border border-gray-150 dark:border-gray-800 rounded-lg p-0.5 bg-gray-50 dark:bg-gray-950 text-[10px] font-bold">
              <button
                onClick={() => setMethod("upload")}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                  method === "upload"
                    ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-400"
                }`}
              >
                Upload Document
              </button>
              <button
                onClick={() => setMethod("paste")}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                  method === "paste"
                    ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-400"
                }`}
              >
                Paste Plain Text
              </button>
              <button
                onClick={() => setMethod("scratch")}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                  method === "scratch"
                    ? "bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-400"
                }`}
              >
                Build from Scratch
              </button>
            </div>
          </div>

          {method === "upload" ? (
            /* DRAG AND DROP ZONE */
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all ${
                isDragActive
                  ? "border-blue-500 bg-blue-50/20 dark:bg-blue-950/10"
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-gray-50/30 dark:bg-gray-950/20"
              }`}
            >
              <input
                type="file"
                id="file-upload-input"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              
              {uploading ? (
                <div className="space-y-4">
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-gray-600 dark:text-gray-300">
                    Extracting content and setting up environment...
                  </p>
                </div>
              ) : (
                <label
                  htmlFor="file-upload-input"
                  className="cursor-pointer space-y-4 flex flex-col items-center"
                >
                  <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100/30 dark:border-blue-900/30">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      Drag & Drop your resume here, or <span className="text-blue-600 dark:text-blue-400 hover:underline">browse</span>
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Supports PDF and ATS-safe DOCX documents up to 5MB
                    </p>
                  </div>
                </label>
              )}
            </div>
          ) : method === "paste" ? (
            /* PLAIN TEXT PASTE CONSOLE */
            <form onSubmit={handlePasteSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-gray-400 uppercase">
                  Session Reference Name
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer - Google Application"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                  disabled={uploading}
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-gray-400 uppercase">
                  Paste Resume Plain Text
                </label>
                <textarea
                  rows={8}
                  required
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste work histories, education, projects, contact parameters, and skill tallies..."
                  className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 font-mono text-[11px] leading-relaxed text-gray-800 dark:text-gray-300"
                  disabled={uploading}
                />
              </div>

              <button
                type="submit"
                disabled={uploading || !pastedText.trim()}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create Session From Paste</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* BUILD FROM SCRATCH CONSOLE */
            <form onSubmit={handleScratchSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-gray-400 uppercase">
                  Resume Workspace Title
                </label>
                <input
                  type="text"
                  required
                  value={scratchTitle}
                  onChange={(e) => setScratchTitle(e.target.value)}
                  placeholder="e.g. Senior Fullstack Developer - 2026 Core Profile"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                  disabled={uploading}
                />
              </div>

              <div className="p-4 bg-blue-50/30 dark:bg-blue-950/10 border border-blue-100/30 dark:border-blue-900/35 rounded-xl space-y-1.5 text-blue-700 dark:text-blue-300">
                <p className="font-bold text-[11px] flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-blue-500" />
                  Blank Interactive Document Workspace
                </p>
                <p className="text-[10px] leading-relaxed text-gray-400 dark:text-gray-500">
                  Starts with a clean, fully-compliant resume layout model. You can write your career history, qualifications, skills, and details directly inside our interactive editor. Completely skips standard files parsing and ATS auditing constraints.
                </p>
              </div>

              <button
                type="submit"
                disabled={uploading || !scratchTitle.trim()}
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Initialize Blank Resume Workspace</span>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="p-3 bg-gray-50/50 dark:bg-gray-950/40 border border-gray-100/50 dark:border-gray-900/60 rounded-xl text-[11px] leading-relaxed text-gray-400 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
            <span>
              <strong>Note on privacy:</strong> All extracted resumes and job description assets remain linked with your secure private database session and are never sold or shared.
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: RECENT SESSIONS LOGGER (5-columns) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-gray-150 dark:border-gray-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Your Sessions ({sessions.length})
            </h2>
            <button
              onClick={fetchSessions}
              className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              disabled={sessionsLoading}
            >
              Refresh
            </button>
          </div>

          {sessionsLoading ? (
            <div className="p-12 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
              <p className="text-xs text-gray-400">Syncing sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-2">
              <div className="h-9 w-9 rounded-full bg-gray-50 dark:bg-gray-800/60 flex items-center justify-center text-gray-400 mx-auto">
                <ClipboardList className="h-4 w-4" />
              </div>
              <h4 className="text-xs font-bold">No active sessions found</h4>
              <p className="text-[10px] text-gray-400 max-w-xs mx-auto">
                Upload or paste your resume on the left to activate your builder workspace.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {sessions.map((session) => {
                const hasScore = session.atsAnalysis && typeof session.atsAnalysis.atsScore === "number";
                const score = hasScore ? session.atsAnalysis.atsScore : null;
                const scoreStyles = score !== null ? getScoreColor(score) : null;

                return (
                  <div
                    key={session._id}
                    onClick={() => navigate(`/builder?sessionId=${session._id}`)}
                    className="group p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-900/50 rounded-xl flex items-center justify-between gap-4 cursor-pointer hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Session Icon */}
                      <div className="h-9 w-9 shrink-0 rounded bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/35 transition-colors">
                        <FileText className="h-5 w-5" />
                      </div>

                      {/* Info */}
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {session.sessionName}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-gray-400">
                          <span className={`px-1.5 py-0.5 rounded font-semibold uppercase ${getStatusBadge(session.status)}`}>
                            {session.status}
                          </span>
                          <span className="flex items-center gap-0.5 font-mono">
                            <Calendar className="h-2.5 w-2.5" />
                            {formatDate(session.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score Ring / Action */}
                    <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {score !== null && scoreStyles ? (
                        <div
                          className={`h-9 w-9 rounded-full ${scoreStyles.bg} flex items-center justify-center font-bold text-xs ${scoreStyles.text} border ${scoreStyles.border}`}
                          title="ATS Score"
                        >
                          {score}
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-300 dark:text-gray-700 font-mono">
                          No ATS
                        </div>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => deleteSession(session._id)}
                        className="p-1.5 text-gray-300 dark:text-gray-700 hover:text-rose-500 dark:hover:text-rose-400 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-colors"
                        title="Delete session"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      {/* Chevron indicator */}
                      <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-700 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
