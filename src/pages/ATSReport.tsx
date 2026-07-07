import React, { useState } from "react";
import ScoreRing from "../components/ScoreRing";
import GapTable from "../components/GapTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { Sparkles, FileText, Send, RefreshCw, Eye, CheckCircle, HelpCircle, Maximize2, Minimize2, X } from "lucide-react";
import toast from "react-hot-toast";

interface ATSReportProps {
  atsData: any;
  onRunATS: (jd: string) => Promise<void>;
  isRunning: boolean;
  savedJd?: string;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const ATSReport: React.FC<ATSReportProps> = ({
  atsData,
  onRunATS,
  isRunning,
  savedJd = "",
  isMaximized = false,
  onToggleMaximize,
}) => {
  const [jobDescription, setJobDescription] = useState<string>(savedJd);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobDescription.trim().length < 100) {
      toast.error("Please paste a realistic job description (minimum 100 characters).");
      return;
    }
    onRunATS(jobDescription);
  };

  if (isRunning) {
    return (
      <div className="py-12 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-center">
        <LoadingSpinner
          text="Evaluating Semantics..."
          subtext="Gemini is comparing your resume achievements against the JD requirements and computing match scores."
        />
      </div>
    );
  }

  // If no ATS data has been generated yet, show the job description submission form
  if (!atsData) {
    return (
      <div className="space-y-4">
        {onToggleMaximize && (
          <div className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 px-4 rounded-xl shadow-xs text-xs font-bold">
            <span className="text-gray-400 font-medium">ATS Audit Configuration</span>
            <button
              onClick={onToggleMaximize}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg shadow-xs cursor-pointer text-gray-750 dark:text-gray-200 transition-colors"
            >
              {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span>{isMaximized ? "Minimize" : "Maximize"}</span>
            </button>
          </div>
        )}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-blue-500" />
              Step 1: Paste Job Description
            </h2>
            <p className="text-xs text-gray-450 dark:text-gray-500">
              Paste the target job description to run a detailed ATS audit.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <textarea
              rows={10}
              required
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description. Include responsibilities, technical keywords, tools, educational criteria, and experience parameters..."
              className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-blue-500 font-sans text-xs leading-relaxed text-gray-800 dark:text-gray-300"
            />

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs cursor-pointer transition-all hover:shadow-md"
            >
              <Sparkles className="h-4 w-4 animate-pulse" />
              <span>Compute ATS Alignment</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ATS Report Results Screen
  const score = atsData.atsScore || 0;
  const shortlistChance = atsData.shortlistProbability || "Medium";
  const catScores = atsData.categoryScores || { keywordMatch: 50, structureFormat: 50, achievementQuantification: 50 };

  return (
    <div className="space-y-6">
      {onToggleMaximize && (
        <div className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 px-4 rounded-xl shadow-xs text-xs font-bold">
          <span className="text-gray-400 font-medium">ATS Scorecard & Audit Report</span>
          <button
            onClick={onToggleMaximize}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xs cursor-pointer text-gray-750 dark:text-gray-200 transition-colors"
          >
            {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span>{isMaximized ? "Minimize" : "Maximize"}</span>
          </button>
        </div>
      )}
      {/* 1. Header & Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm items-center">
        {/* Left Side: ScoreRing */}
        <div className="md:col-span-4 flex justify-center py-2">
          <ScoreRing score={score} label="Overall Match Score" size={170} />
        </div>

        {/* Right Side: Probability Summary */}
        <div className="md:col-span-8 space-y-4">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-400">Shortlisting Assessment</span>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold tracking-tight">
                {shortlistChance} Probability
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                AI Assessed
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Based on matching keywords, technical stack gaps, and formatting checks, Gemini predicts a <strong>{shortlistChance}</strong> probability of making the automated human-review shortlist.
            </p>
          </div>

          {/* Category-by-Category Scores */}
          <div className="space-y-3 pt-2 text-[11px]">
            {/* keywordMatch */}
            <div className="space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>Keyword & Technology Fit</span>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{catScores.keywordMatch}%</span>
              </div>
              <div className="h-2 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${catScores.keywordMatch}%` }} />
              </div>
            </div>

            {/* structureFormat */}
            <div className="space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>Structure, Sections & Layout Safety</span>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{catScores.structureFormat}%</span>
              </div>
              <div className="h-2 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 dark:bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${catScores.structureFormat}%` }} />
              </div>
            </div>

            {/* achievementQuantification */}
            <div className="space-y-1">
              <div className="flex justify-between text-gray-400">
                <span>Quantification & Impact Alignment</span>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{catScores.achievementQuantification}%</span>
              </div>
              <div className="h-2 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${catScores.achievementQuantification}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Checklist Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            Requirements Gap Check
          </h3>
          <p className="text-xs text-gray-400">
            A precise evaluation of each requirement extracted from the Job Description, matched against your resume.
          </p>
        </div>
        <GapTable gaps={atsData.gaps} />
      </div>

      {/* 3. Honest Suggestions */}
      {atsData.honestSuggestions && atsData.honestSuggestions.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
            Honest Optimization Actions
          </h3>
          <ul className="space-y-2 text-xs text-gray-650 dark:text-gray-350 leading-relaxed list-none pl-0">
            {atsData.honestSuggestions.map((sug: string, i: number) => (
              <li key={`sug-${i}`} className="flex items-start gap-2.5 p-2 bg-gray-50/55 dark:bg-gray-950/20 rounded border border-gray-100/30 dark:border-gray-800">
                <span className="flex h-5 w-5 shrink-0 rounded-full bg-blue-50 dark:bg-blue-950 text-[10px] font-bold text-blue-600 dark:text-blue-400 items-center justify-center">
                  {i + 1}
                </span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 4. Re-analyze Trigger */}
      <div className="p-4 bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-900 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Want to update the target Job Description or re-run the score?
        </div>
        <button
          onClick={() => onRunATS(savedJd)}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors shrink-0"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Re-Analyze Match
        </button>
      </div>
    </div>
  );
};

export default ATSReport;
