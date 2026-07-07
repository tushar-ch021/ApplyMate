import React, { useState, useRef, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import DownloadButtons from "../components/DownloadButtons";
import ResumeEditor from "../components/ResumeEditor";
import ResumeLivePreview from "../components/ResumeLivePreview";
import { useAnalysis } from "../hooks/useAnalysis";
import {
  Sparkles,
  LayoutGrid,
  RotateCcw,
  PenTool,
  CheckSquare,
  MessageSquare,
  Eye,
  Settings,
  Send,
  Bot,
  Loader2,
  LineChart,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface ResumeOptimizerProps {
  sessionId: string;
  originalText: string;
  optimizedResume: any;
  onRunOptimize: () => Promise<void>;
  onSaveResume: (updatedResume: any) => Promise<void>;
  onAIEdit: (sectionName: string, sectionContent: string) => void;
  isRunning: boolean;
  maximizedElement?: string | null;
  onToggleMaximize?: (element: string) => void;
}

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export const ResumeOptimizer: React.FC<ResumeOptimizerProps> = ({
  sessionId,
  originalText = "",
  optimizedResume,
  onRunOptimize,
  onSaveResume,
  onAIEdit,
  isRunning,
  maximizedElement = null,
  onToggleMaximize,
}) => {
  const { runResumeChatEdit } = useAnalysis();

  // Top level workspace tabs
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"edit" | "preview">("edit");

  // Aesthetic adjustments
  const [selectedTheme, setSelectedTheme] = useState<string>("classic");
  const [selectedSpacing, setSelectedSpacing] = useState<"snug" | "normal" | "loose">("normal");

  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hello! I am your AI Resume Editor and Designer. Ask me to make changes to your content (e.g. 'Add Node.js as a backend framework', 'Make the summary section shorter') or adjust design elements (e.g. 'Change layout theme to Minimalist' or 'Adjust spacing to snugly fit one page')!",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Sync the theme from resume JSON theme attribute if present
  useEffect(() => {
    if (optimizedResume?.theme) {
      const t = optimizedResume.theme.toLowerCase();
      if (["classic", "modern", "minimalist", "creative"].includes(t)) {
        setSelectedTheme(t);
      }
    }
  }, [optimizedResume]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatLoading]);

  // Chat message submit
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading || !sessionId) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    const newHistory = [...chatMessages, { role: "user" as const, text: userText }];
    setChatMessages(newHistory);
    setIsChatLoading(true);

    try {
      const response = await runResumeChatEdit(sessionId, userText, chatMessages);
      if (response && response.updatedResume) {
        // Update the database with the AI-revised resume JSON
        await onSaveResume(response.updatedResume);

        // Append assistant text response to chat
        setChatMessages((prev) => [
          ...prev,
          { role: "model" as const, text: response.assistantResponse || "Resume updated successfully." },
        ]);

        // Sync local selected theme from AI update if altered
        if (response.updatedResume.theme) {
          const t = response.updatedResume.theme.toLowerCase();
          if (["classic", "modern", "minimalist", "creative"].includes(t)) {
            setSelectedTheme(t);
          }
        }
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "model" as const, text: "I apologize, I could not complete that edit. Please try again with clear instructions." },
        ]);
      }
    } catch (err) {
      console.error("Resume Chat Edit error:", err);
      setChatMessages((prev) => [
        ...prev,
        { role: "model" as const, text: "An error occurred while communicating with the AI. Please try again." },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (isRunning) {
    return (
      <div className="py-12 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-center">
        <LoadingSpinner
          text="Structuring & Aligning Achievements..."
          subtext="Gemini is translating passive phrasing, inserting target skills naturally, and preparing an interactive JSON workspace sheet."
        />
      </div>
    );
  }

  // If no optimized resume structure exists yet, show the trigger dashboard card
  if (!optimizedResume) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-8 shadow-sm max-w-2xl mx-auto text-center space-y-6">
        <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            AI Resume Content Optimizer
          </h2>
          <p className="text-xs text-gray-450 dark:text-gray-500 max-w-md mx-auto leading-relaxed">
            Generate an optimized, modular version of your resume content tailored specifically to the target Job Description. Passive phrasing will be aligned and relevant experiences highlighted.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2 text-[11px]">
          <div className="p-3.5 bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-900 rounded-lg space-y-1">
            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <RotateCcw className="h-3 w-3 text-blue-500" />
              Tailored Phrasing
            </span>
            <p className="text-gray-450 leading-relaxed">Better aligns your roles with keywords without fabricating history.</p>
          </div>
          <div className="p-3.5 bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-900 rounded-lg space-y-1">
            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <PenTool className="h-3 w-3 text-blue-500" />
              Inline Editor
            </span>
            <p className="text-gray-450 leading-relaxed">Tweak wording, rewrite bullets, and adjust technical skills in place.</p>
          </div>
          <div className="p-3.5 bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-900 rounded-lg space-y-1">
            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
              <CheckSquare className="h-3 w-3 text-blue-500" />
              Export Ready
            </span>
            <p className="text-gray-450 leading-relaxed">Download your final customized copy in PDF or Word format.</p>
          </div>
        </div>

        <button
          onClick={onRunOptimize}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs cursor-pointer transition-all hover:shadow-md"
        >
          Generate Optimized Resume & Workspace Sheet
        </button>
      </div>
    );
  }

  return (
    <div className={maximizedElement === "optimize" || maximizedElement === "chat" || maximizedElement === "resume-preview" ? "flex-1 flex flex-col h-full overflow-hidden space-y-4" : "space-y-6"}>
      {/* 1. Global Workspace Mode Tabs & Download Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-850 pb-4">
          <div className="space-y-0.5 text-center lg:text-left">
            <h2 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white uppercase">
              Document Workspace Builder
            </h2>
            <p className="text-xs text-gray-450 dark:text-gray-500">
              Select design modes below, live chat to edit, and download your high-performance professional resume.
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full lg:w-auto">
            <div className="flex bg-gray-100 dark:bg-gray-950 p-1 rounded-xl text-xs font-bold shrink">
              <button
                onClick={() => setActiveWorkspaceTab("edit")}
                className={`px-2.5 sm:px-4 py-1.5 rounded-lg flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-[10px] sm:text-xs ${
                  activeWorkspaceTab === "edit"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-200/60 dark:text-gray-400 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <PenTool className="h-3.5 w-3.5" />
                <span>Interactive Form Editor</span>
              </button>
              <button
                onClick={() => setActiveWorkspaceTab("preview")}
                className={`px-2.5 sm:px-4 py-1.5 rounded-lg flex items-center gap-1 sm:gap-1.5 transition-all cursor-pointer text-[10px] sm:text-xs ${
                  activeWorkspaceTab === "preview"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-200/60 dark:text-gray-400 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span>Live Preview & Style Chat</span>
              </button>
            </div>
            {onToggleMaximize && (
              <button
                onClick={() => onToggleMaximize("optimize")}
                className="p-2 rounded-xl bg-gray-50 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-800 cursor-pointer flex items-center gap-1 font-bold text-[10px] sm:text-xs shadow-xs transition-colors"
                title={maximizedElement === "optimize" ? "Minimize" : "Maximize Full Page"}
              >
                {maximizedElement === "optimize" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                <span className="hidden sm:inline">{maximizedElement === "optimize" ? "Minimize" : "Maximize"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Compile & Download Row (Displays in the form editor view) */}
        {activeWorkspaceTab === "edit" && (
          <DownloadButtons resumeJson={optimizedResume} />
        )}
      </div>

      {/* 2. MODE 1: INTERACTIVE FORM EDITOR VIEW */}
      {activeWorkspaceTab === "edit" ? (
        <div className={maximizedElement === "optimize" ? "flex-1 overflow-hidden min-h-0" : ""}>
          <ResumeEditor
            originalText={originalText}
            optimizedData={optimizedResume}
            onSave={onSaveResume}
            onAIEdit={onAIEdit}
            isMaximized={maximizedElement === "optimize"}
            onToggleMaximize={() => onToggleMaximize?.("optimize")}
          />
        </div>
      ) : (
        /* MODE 2: LIVE PREVIEW & STYLE CHAT PANEL */
        <div className={maximizedElement ? "flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0" : "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"}>
          {/* Left Panel: Preview (7-cols) */}
          <div className={
            maximizedElement === "resume-preview"
              ? "fixed inset-0 z-[60] bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 md:p-8 flex flex-col h-full w-full animate-fade-in space-y-4 overflow-hidden"
              : "lg:col-span-7 space-y-4"
          }>
            {/* Design Controls */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs font-bold shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 uppercase text-[9px] tracking-wider">Aesthetic Theme:</span>
                <div className="flex gap-1">
                  {["classic", "modern", "minimalist", "creative"].map((t) => (
                    <button
                      key={t}
                      onClick={async () => {
                        setSelectedTheme(t);
                        // Save the selected theme to resume JSON
                        const copy = JSON.parse(JSON.stringify(optimizedResume));
                        copy.theme = t;
                        await onSaveResume(copy);
                      }}
                      className={`px-2.5 py-1 rounded text-[10px] capitalize cursor-pointer transition-all ${
                        selectedTheme === t
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 text-gray-650 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 uppercase text-[9px] tracking-wider">Spacing:</span>
                  <div className="flex bg-gray-100 dark:bg-gray-950 p-0.5 rounded border border-gray-200 dark:border-gray-800">
                    {(["snug", "normal", "loose"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSpacing(s)}
                        className={`px-2.5 py-1 rounded text-[10px] capitalize cursor-pointer transition-all ${
                          selectedSpacing === s
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-gray-500 hover:bg-gray-200/60 dark:text-gray-400 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                {onToggleMaximize && (
                  <button
                    onClick={() => onToggleMaximize("resume-preview")}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white cursor-pointer flex items-center gap-1 font-bold text-[10px] shadow-xs transition-colors"
                    title={maximizedElement === "resume-preview" ? "Minimize Resume Preview" : "Maximize Resume Preview"}
                  >
                    {maximizedElement === "resume-preview" ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    <span>{maximizedElement === "resume-preview" ? "Minimize" : "Maximize"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Resume Sheet Container */}
            <div className={maximizedElement === "resume-preview" ? "flex-1 overflow-y-auto pr-1" : ""}>
              <ResumeLivePreview
                resume={optimizedResume}
                theme={selectedTheme}
                spacing={selectedSpacing}
              />
            </div>
          </div>

          {/* Right Panel: AI Resume Editor Chat (5-cols) */}
          <div className={
            maximizedElement === "chat"
              ? "fixed inset-0 z-[60] bg-white dark:bg-gray-900 p-4 sm:p-6 md:p-8 flex flex-col h-full w-full shadow-2xl animate-fade-in overflow-hidden"
              : "lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col h-[650px] overflow-hidden"
          }>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase">Aesthetic Style & Spacing Chat</h3>
                  <p className="text-[9px] text-gray-400">Direct Gemini to rephrase bullet points or modify styling parameters.</p>
                </div>
              </div>
              {onToggleMaximize && (
                <button
                  type="button"
                  onClick={() => onToggleMaximize("chat")}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white cursor-pointer flex items-center gap-1 text-[10px] font-bold shrink-0 transition-colors"
                  title={maximizedElement === "chat" ? "Minimize Style Chat" : "Maximize Style Chat"}
                >
                  {maximizedElement === "chat" ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  <span>{maximizedElement === "chat" ? "Minimize" : "Maximize"}</span>
                </button>
              )}
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={`editor-msg-${idx}`}
                  className={`flex items-start gap-2.5 max-w-[85%] ${
                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {msg.role === "user" ? "ME" : <Bot className="h-4 w-4" />}
                  </div>

                  <div
                    className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-tr-none text-[11px]"
                        : "bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-tl-none text-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex items-start gap-2.5 mr-auto max-w-[85%]">
                  <div className="h-7 w-7 rounded-full shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-gray-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    <span className="text-[10px] italic">Assistant is adjusting document state...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Downloader trigger when in Preview Mode */}
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-950/20">
              <DownloadButtons resumeJson={optimizedResume} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40">
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="e.g. Add TypeScript to Languages and make spacing snug..."
                  className="w-full pl-3 pr-10 py-2.5 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
                  disabled={isChatLoading}
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !inputMessage.trim()}
                  className="absolute right-1.5 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeOptimizer;
