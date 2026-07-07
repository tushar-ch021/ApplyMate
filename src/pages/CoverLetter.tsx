import React, { useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { copyToClipboard } from "../utils/helpers";
import { Sparkles, FileText, Clipboard, Check, RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import toast from "react-hot-toast";

interface CoverLetterProps {
  coverLetterText?: string;
  onGenerate: (company: string, role: string, tone: string) => Promise<void>;
  isRunning: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const CoverLetter: React.FC<CoverLetterProps> = ({
  coverLetterText = "",
  onGenerate,
  isRunning,
  isMaximized = false,
  onToggleMaximize,
}) => {
  const [companyName, setCompanyName] = useState<string>("");
  const [roleName, setRoleName] = useState<string>("");
  const [tone, setTone] = useState<string>("Professional");
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !roleName.trim()) {
      toast.error("Please fill out both the Company and Role Title fields.");
      return;
    }
    onGenerate(companyName.trim(), roleName.trim(), tone);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(coverLetterText, "Cover Letter");
    if (ok) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isRunning) {
    return (
      <div className="py-12 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm flex items-center justify-center">
        <LoadingSpinner
          text="Drafting Tailored Cover Letter..."
          subtext="Gemini is alignment-checking company requirements, picking relevant accomplishments, and structuring standard headers."
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {onToggleMaximize && (
        <div className="flex justify-between items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 px-4 rounded-xl shadow-xs text-xs font-bold">
          <span className="text-gray-400 font-medium">Cover Letter Module</span>
          <button
            onClick={onToggleMaximize}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-lg shadow-xs cursor-pointer text-gray-750 dark:text-gray-200 transition-colors"
          >
            {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span>{isMaximized ? "Minimize" : "Maximize"}</span>
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Form Controls (Left panel: 4-cols) */}
      <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Letter Configurations
          </h3>
          <p className="text-[10px] text-gray-400">
            Specify job-specific parameters to help our AI align the salutations and value-propositions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 mb-1 font-semibold">Target Company</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Google LLC"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-semibold">Role Title</label>
            <input
              type="text"
              required
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1 font-semibold">Writing Tone Preset</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white font-medium"
            >
              <option value="Professional">Professional (Assertive, corporate)</option>
              <option value="Friendly">Friendly (Approachable, warm, startup)</option>
              <option value="Concise">Concise (Compact, impact-driven)</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:shadow"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Cover Letter</span>
          </button>
        </form>
      </div>

      {/* Output Letter Paper Sheet (Right panel: 8-cols) */}
      <div className="lg:col-span-8 space-y-4">
        {coverLetterText ? (
          <div className="space-y-4 animate-fade-in">
            {/* Header control toolbar */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl text-xs">
              <span className="text-gray-400 font-medium">Letter Draft Ready</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded shadow-xs font-semibold cursor-pointer text-gray-700 dark:text-white"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="h-3 w-3" />
                    <span>Copy Letter Body</span>
                  </>
                )}
              </button>
            </div>

            {/* Letter Paper Visual Sheet */}
            <div className="p-8 sm:p-12 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm text-xs leading-relaxed space-y-4 whitespace-pre-wrap font-sans max-w-2xl mx-auto border-t-[8px] border-t-blue-600">
              {coverLetterText}
            </div>
          </div>
        ) : (
          /* Empty State Placeholder */
          <div className="h-full min-h-[400px] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-950/20 flex flex-col items-center justify-center text-center p-8">
            <div className="h-10 w-10 rounded bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400 mb-3">
              <FileText className="h-5 w-5" />
            </div>
            <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300">Letter draft is empty</h4>
            <p className="text-[10px] text-gray-450 max-w-xs leading-relaxed">
              Configure parameters and click "Generate Cover Letter" to build a tailored letter aligned with your resume's experience and the JD requirements.
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default CoverLetter;
