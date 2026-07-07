import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { getScoreColor, formatDate } from "../utils/helpers";
import { Trash2, FileText, Calendar, LayoutGrid, Clock, ArrowRight, Loader2, ChevronRight } from "lucide-react";

export const History: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, loading, fetchSessions, deleteSession } = useSession();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const getStatusBadgeClass = (status: string) => {
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          History Log
        </h1>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Review, open, or delete your historical ATS evaluation records and customized document builds.
        </p>
      </div>

      {loading ? (
        <div className="p-20 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-xs text-gray-400">Retrieving saved logs...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl space-y-3">
          <div className="h-12 w-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-450 mx-auto">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">History log is empty</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            You haven't run any resume analyses yet. Create a session on the dashboard to populate logs.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-4 py-2 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            Create Session
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800 text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-950 font-semibold text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Session Reference</th>
                  <th className="px-6 py-3.5">Date Created</th>
                  <th className="px-6 py-3.5">Workflow Status</th>
                  <th className="px-6 py-3.5 text-center">ATS Score</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                {sessions.map((session) => {
                  const hasScore = session.atsAnalysis && typeof session.atsAnalysis.atsScore === "number";
                  const score = hasScore ? session.atsAnalysis.atsScore : null;
                  const colors = score !== null ? getScoreColor(score) : null;

                  return (
                    <tr
                      key={session._id}
                      onClick={() => navigate(`/builder?sessionId=${session._id}`)}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-950/20 cursor-pointer transition-colors group"
                    >
                      {/* Name */}
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white max-w-xs truncate">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-gray-400 shrink-0 group-hover:text-blue-500 transition-colors" />
                          <span>{session.sessionName}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-gray-550 dark:text-gray-400 whitespace-nowrap font-mono">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-350" />
                          <span>{formatDate(session.createdAt)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusBadgeClass(session.status)}`}>
                          {session.status}
                        </span>
                      </td>

                      {/* Score */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {score !== null && colors ? (
                          <span className={`inline-flex items-center justify-center font-bold text-xs h-7 w-12 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
                            {score}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-700 font-mono">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => deleteSession(session._id)}
                            className="p-1.5 rounded text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer transition-colors"
                            title="Delete Session Log"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-700 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
