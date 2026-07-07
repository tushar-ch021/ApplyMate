import React from "react";
import { copyToClipboard } from "../utils/helpers";
import { Copy } from "lucide-react";

interface KeywordBadgesProps {
  matched?: string[];
  missing?: string[];
  weak?: string[];
}

export const KeywordBadges: React.FC<KeywordBadgesProps> = ({
  matched = [],
  missing = [],
  weak = [],
}) => {
  const handleCopyMissing = (kw: string) => {
    copyToClipboard(kw, "Keyword");
  };

  return (
    <div className="space-y-6">
      {/* Missing Keywords (Critical Gaps) */}
      {missing.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold tracking-tight text-gray-700 dark:text-gray-300">
              🔴 Missing Keywords ({missing.length})
            </h4>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
              Click any keyword to copy
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {missing.map((kw, i) => (
              <button
                key={`missing-${i}`}
                onClick={() => handleCopyMissing(kw)}
                className="group flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/80 transition-colors cursor-pointer text-left"
                title="Click to copy keyword"
              >
                <span>{kw}</span>
                <Copy className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weak Keywords (Under-represented) */}
      {weak.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold tracking-tight text-gray-700 dark:text-gray-300 mb-3">
            🟡 Weak Keywords ({weak.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {weak.map((kw, i) => (
              <span
                key={`weak-${i}`}
                className="px-3 py-1 text-xs font-medium rounded-full text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Matched Keywords (Aligned strengths) */}
      {matched.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold tracking-tight text-gray-700 dark:text-gray-300 mb-3">
            🟢 Matched Keywords ({matched.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {matched.map((kw, i) => (
              <span
                key={`matched-${i}`}
                className="px-3 py-1 text-xs font-medium rounded-full text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {matched.length === 0 && missing.length === 0 && weak.length === 0 && (
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-400">No keyword breakdown loaded yet.</p>
        </div>
      )}
    </div>
  );
};

export default KeywordBadges;
