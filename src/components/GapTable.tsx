import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface GapItem {
  requirement: string;
  present: boolean;
  evidence: string | null;
  improvementOpportunity: string;
}

interface GapTableProps {
  gaps?: GapItem[];
}

export const GapTable: React.FC<GapTableProps> = ({ gaps = [] }) => {
  if (gaps.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center text-sm text-gray-400">
        No gap analysis findings loaded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm">
      <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-left">
        <thead className="bg-gray-50 dark:bg-gray-900 text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
          <tr>
            <th className="px-4 py-3">JD Requirement</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3">Evidence Found</th>
            <th className="px-4 py-3">Improvement Opportunity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-950 text-xs">
          {gaps.map((gap, index) => {
            const isPresent = gap.present;
            return (
              <tr
                key={`gap-${index}`}
                className={`${
                  isPresent
                    ? "bg-emerald-50/10 dark:bg-emerald-950/5 hover:bg-emerald-50/20"
                    : "bg-rose-50/10 dark:bg-rose-950/5 hover:bg-rose-50/20"
                } transition-colors`}
              >
                {/* 1. JD Requirement */}
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-xs">
                  {gap.requirement}
                </td>

                {/* 2. Status */}
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <div className="flex justify-center">
                    {isPresent ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950/30">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Matched
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950/30">
                        <AlertTriangle className="h-3 w-3 text-rose-500" />
                        Missing
                      </span>
                    )}
                  </div>
                </td>

                {/* 3. Evidence */}
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed italic">
                  {isPresent ? (
                    gap.evidence || "Implicit match"
                  ) : (
                    <span className="text-gray-300 dark:text-gray-700">None found</span>
                  )}
                </td>

                {/* 4. Improvement Tip */}
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-sm leading-relaxed">
                  {gap.improvementOpportunity}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GapTable;
