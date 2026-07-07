import React, { useState, useRef, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAnalysis } from "../hooks/useAnalysis";
import {
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User,
  Bookmark,
  Cpu,
  Send,
  Bot,
  Plus,
  Loader2,
  FolderKanban,
  MessageSquareCode,
  CheckCircle,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface InterviewPrepProps {
  prepData: any;
  onGenerate: () => Promise<void>;
  isRunning: boolean;
  sessionId: string;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
  isChatMaximized?: boolean;
  onToggleMaximizeChat?: () => void;
}

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export const InterviewPrep: React.FC<InterviewPrepProps> = ({
  prepData,
  onGenerate,
  isRunning,
  sessionId,
  isMaximized = false,
  onToggleMaximize,
  isChatMaximized = false,
  onToggleMaximizeChat,
}) => {
  const { runInterviewPrep, runInterviewPrepChat } = useAnalysis();
  const [subTab, setSubTab] = useState<"technical" | "behavioral" | "projects">("technical");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // More generation state
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [localPrepData, setLocalPrepData] = useState<any>(prepData);

  // Chat states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "model",
      text: "Hi! I'm your interactive AI Interview Coach. Ask me to quiz you, give feedback on your STAR answer, or clarify technical concepts!",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Keep local prep data in sync with prop updates
  useEffect(() => {
    if (prepData) {
      setLocalPrepData(prepData);
    }
  }, [prepData]);

  // Prevent background body scroll when maximized
  useEffect(() => {
    if (isMaximized || isChatMaximized) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMaximized, isChatMaximized]);

  // Auto scroll chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isChatLoading]);

  const toggleExpand = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  // Generate more questions handler
  const handleGenerateMore = async () => {
    if (isGeneratingMore || !sessionId) return;
    setIsGeneratingMore(true);
    try {
      const updatedData = await runInterviewPrep(sessionId, true);
      if (updatedData) {
        setLocalPrepData(updatedData);
      }
    } catch (error) {
      console.error("Failed to generate more questions", error);
    } finally {
      setIsGeneratingMore(false);
    }
  };

  // Chat submit handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading || !sessionId) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    const newHistory = [...chatMessages, { role: "user" as const, text: userText }];
    setChatMessages(newHistory);
    setIsChatLoading(true);

    try {
      const response = await runInterviewPrepChat(sessionId, userText, chatMessages);
      if (response && response.text) {
        setChatMessages((prev) => [...prev, { role: "model" as const, text: response.text }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "model" as const, text: "I apologize, I didn't get that response cleanly. Please try again." },
        ]);
      }
    } catch (error) {
      console.error("Prep chat failed", error);
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
      <div className="py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-center">
        <LoadingSpinner
          text="Compiling Coaching Prep..."
          subtext="Gemini is scanning target technologies, mapping interview frameworks, and drafting custom STAR achievements."
        />
      </div>
    );
  }

  // If no prep data exists yet, show trigger card
  if (!localPrepData) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm max-w-xl mx-auto text-center space-y-5">
        <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
          <Bookmark className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            Interview Prep & STAR Coach
          </h2>
          <p className="text-xs text-gray-450 dark:text-gray-500 max-w-sm mx-auto leading-relaxed">
            Generate customized technical questions, professional behavioral STAR stories, and project-based Q&As mapped directly to target job descriptions and your resume's experience history.
          </p>
        </div>

        <button
          onClick={onGenerate}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs cursor-pointer transition-all"
        >
          Generate Prep Materials
        </button>
      </div>
    );
  }

  const technical = localPrepData.technicalQuestions || [];
  const behavioral = localPrepData.behavioralQuestions || localPrepData.behavioralSTAR || [];
  const projects = localPrepData.projectQuestions || [];

  return (
    <div className="space-y-4">
      {onToggleMaximize && (
        <div className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 px-4 rounded-xl shadow-xs text-xs font-bold">
          <span className="text-gray-400 font-medium">Interview Coaching Module</span>
          <button
            onClick={onToggleMaximize}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg shadow-xs cursor-pointer text-gray-750 dark:text-gray-200 text-xs font-bold transition-colors"
          >
            {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span>{isMaximized ? "Minimize" : "Maximize"}</span>
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* LEFT COLUMN: Structured Questions (7-columns) */}
      <div className={`lg:col-span-7 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col ${isMaximized ? "h-[calc(100vh-200px)]" : "h-[580px]"} overflow-hidden`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="space-y-0.5">
            <h2 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white uppercase flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
              Interactive Prep Curriculum
            </h2>
            <p className="text-[10px] text-gray-450 dark:text-gray-500">
              Each section is populated with 7-10 custom, high-impact practice questions.
            </p>
          </div>

          <button
            onClick={handleGenerateMore}
            disabled={isGeneratingMore}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isGeneratingMore ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Expanding List...</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Generate More Qs</span>
              </>
            )}
          </button>
        </div>

        {/* Visual Sub-Tab Toggles */}
        <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-800 text-xs font-bold gap-4 sm:gap-6">
          <button
            onClick={() => {
              setSubTab("technical");
              setExpandedIndex(null);
            }}
            className={`pb-3 border-b-2 px-1 transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "technical"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Cpu className="h-4 w-4" />
            Technical Skills Q&A ({technical.length})
          </button>

          <button
            onClick={() => {
              setSubTab("behavioral");
              setExpandedIndex(null);
            }}
            className={`pb-3 border-b-2 px-1 transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "behavioral"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <User className="h-4 w-4" />
            Behavioral Questions ({behavioral.length})
          </button>

          <button
            onClick={() => {
              setSubTab("projects");
              setExpandedIndex(null);
            }}
            className={`pb-3 border-b-2 px-1 transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "projects"
                ? "border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400"
                : "border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <FolderKanban className="h-4 w-4" />
            Project Based Qs ({projects.length})
          </button>
        </div>

        {/* SUB-TAB CONTENTS */}
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {subTab === "technical" && (
            /* TECHNICAL ACCORDIONS */
            technical.length === 0 ? (
              <p className="text-xs text-gray-450 dark:text-gray-500 text-center py-6">
                No technical questions generated. Click "Generate More Qs" above to populate!
              </p>
            ) : (
              <div className="space-y-3">
                {technical.map((item: any, idx: number) => {
                  const isExpanded = expandedIndex === idx;
                  return (
                    <div
                      key={`tech-${idx}`}
                      className="bg-white dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-xs transition-shadow hover:shadow-sm"
                    >
                      {/* Header */}
                      <button
                        onClick={() => toggleExpand(idx)}
                        className="w-full p-4 flex items-start justify-between gap-4 text-left cursor-pointer focus:outline-none"
                      >
                        <div className="space-y-1 min-w-0">
                          {item.whyAsked && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-100/30">
                              Goal: {item.whyAsked}
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white pr-2">
                            {item.question}
                          </h4>
                        </div>
                        <div className="p-1 rounded bg-gray-50 dark:bg-gray-800 text-gray-400 shrink-0 mt-1">
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </div>
                      </button>

                      {/* Answer (Expandable panel) */}
                      {isExpanded && (
                        <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border-t border-gray-100 dark:border-gray-800 text-xs leading-relaxed text-gray-750 dark:text-gray-300 space-y-2.5 animate-fade-in">
                          <div className="font-semibold text-gray-400 uppercase text-[9px] tracking-wider">Suggested Response Strategy</div>
                          <p className="font-mono text-[11px] whitespace-pre-wrap bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-850">
                            {item.answerFramework || item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {subTab === "behavioral" && (
            /* BEHAVIORAL STAR CARDS */
            behavioral.length === 0 ? (
              <p className="text-xs text-gray-450 dark:text-gray-500 text-center py-6">
                No behavioral STAR questions available. Click "Generate More Qs" above.
              </p>
            ) : (
              <div className="space-y-4">
                {behavioral.map((story: any, idx: number) => {
                  const isExpanded = expandedIndex === idx;
                  return (
                    <div
                      key={`star-${idx}`}
                      className="bg-white dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-xs"
                    >
                      {/* Header */}
                      <button
                        onClick={() => toggleExpand(idx)}
                        className="w-full p-4 flex items-start justify-between gap-4 text-left cursor-pointer focus:outline-none"
                      >
                        <div className="space-y-1 min-w-0">
                          {story.relevantResumeMoment && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-100/30">
                              Resume Target: {story.relevantResumeMoment}
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white pr-2">
                            {story.question || story.scenario}
                          </h4>
                        </div>
                        <div className="p-1 rounded bg-gray-50 dark:bg-gray-800 text-gray-400 shrink-0 mt-1">
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </div>
                      </button>

                      {/* Expandable STAR structure */}
                      {isExpanded && (
                        <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border-t border-gray-100 dark:border-gray-800 text-xs leading-relaxed space-y-4 animate-fade-in">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                            {/* Situation */}
                            <div className="p-3 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-lg space-y-1">
                              <span className="font-bold text-blue-600 dark:text-blue-450 uppercase text-[9px] tracking-wider block">S - Situation</span>
                              <p className="text-gray-600 dark:text-gray-300">{(story.starTemplate || story).situation}</p>
                            </div>

                            {/* Task */}
                            <div className="p-3 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-lg space-y-1">
                              <span className="font-bold text-blue-600 dark:text-blue-450 uppercase text-[9px] tracking-wider block">T - Task</span>
                              <p className="text-gray-600 dark:text-gray-300">{(story.starTemplate || story).task}</p>
                            </div>

                            {/* Action */}
                            <div className="p-3 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-lg space-y-1 md:col-span-2 border-l-[3px] border-l-blue-500">
                              <span className="font-bold text-blue-700 dark:text-blue-400 uppercase text-[9px] tracking-wider block">A - Action (Key engineering steps)</span>
                              <p className="text-gray-650 dark:text-gray-300 font-medium">{(story.starTemplate || story).action}</p>
                            </div>

                            {/* Result */}
                            <div className="p-3 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-lg space-y-1 md:col-span-2 border-l-[3px] border-l-emerald-500">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[9px] tracking-wider block">R - Result (Quantifiable metrics)</span>
                              <p className="text-gray-650 dark:text-gray-300 font-medium">{(story.starTemplate || story).result}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {subTab === "projects" && (
            /* PROJECT BASED ACCORDIONS */
            projects.length === 0 ? (
              <p className="text-xs text-gray-450 dark:text-gray-500 text-center py-6">
                No project-based technical questions available yet. Click "Generate More Qs" above to construct them!
              </p>
            ) : (
              <div className="space-y-3">
                {projects.map((item: any, idx: number) => {
                  const isExpanded = expandedIndex === idx;
                  return (
                    <div
                      key={`project-${idx}`}
                      className="bg-white dark:bg-gray-950/40 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-xs transition-shadow hover:shadow-sm"
                    >
                      {/* Header */}
                      <button
                        onClick={() => toggleExpand(idx)}
                        className="w-full p-4 flex items-start justify-between gap-4 text-left cursor-pointer focus:outline-none"
                      >
                        <div className="space-y-1 min-w-0">
                          {item.project && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100/30">
                              Project: {item.project}
                            </span>
                          )}
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white pr-2">
                            {item.question}
                          </h4>
                        </div>
                        <div className="p-1 rounded bg-gray-50 dark:bg-gray-800 text-gray-400 shrink-0 mt-1">
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </div>
                      </button>

                      {/* Detail panel */}
                      {isExpanded && (
                        <div className="p-4 bg-gray-50/50 dark:bg-gray-950/20 border-t border-gray-100 dark:border-gray-800 text-xs leading-relaxed text-gray-750 dark:text-gray-300 space-y-3.5 animate-fade-in">
                          <div className="space-y-1">
                            <span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider block">The Engineering Challenge</span>
                            <p className="text-gray-650 dark:text-gray-300">{item.challengeHighlight}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="font-bold text-gray-400 uppercase text-[9px] tracking-wider block">Coaching Answer Strategy</span>
                            <p className="font-mono text-[11px] whitespace-pre-wrap bg-white dark:bg-gray-950 p-3 rounded-lg border border-gray-100 dark:border-gray-850">
                              {item.answerStrategy}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: AI Prep Coach Chat (5-columns) */}
      <div className={
        isChatMaximized
          ? "fixed inset-0 z-[60] bg-white dark:bg-gray-900 p-6 md:p-10 overflow-y-auto flex flex-col h-full w-full shadow-2xl animate-fade-in"
          : "lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col h-[580px] overflow-hidden"
      }>
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <MessageSquareCode className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase">AI Prep Coach Chat</h3>
              <p className="text-[9px] text-gray-400">Interactive mock interviewer, STAR optimizer & advice.</p>
            </div>
          </div>
          {onToggleMaximizeChat && (
            <button
              type="button"
              onClick={onToggleMaximizeChat}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white cursor-pointer flex items-center gap-1 text-[10px] font-bold shrink-0 transition-colors"
              title={isChatMaximized ? "Minimize Chat" : "Maximize Chat"}
            >
              {isChatMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span>{isChatMaximized ? "Minimize" : "Maximize"}</span>
            </button>
          )}
        </div>

        {/* Message Panel */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
          {chatMessages.map((msg, idx) => (
            <div
              key={`msg-${idx}`}
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
                    : "bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-tl-none text-gray-800 dark:text-gray-300"
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
              <div className="p-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-2xl rounded-tl-none flex items-center gap-1.5 text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                <span className="text-[10px] italic">Coach is formulating response...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40">
          <div className="relative flex items-center">
            <input
              type="text"
              required
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="e.g. Quiz me on a hard technical question..."
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
  </div>
);
};

export default InterviewPrep;
