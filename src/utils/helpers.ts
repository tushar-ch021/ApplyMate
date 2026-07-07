import toast from "react-hot-toast";

/**
 * Copy plain text to user's system clipboard
 */
export const copyToClipboard = async (text: string, label: string = "Text"): Promise<boolean> => {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
    return true;
  } catch (err) {
    console.error("Clipboard copy failed:", err);
    toast.error("Failed to copy to clipboard.");
    return false;
  }
};

/**
 * Formats standard ISO dates to friendly localized strings
 */
export const formatDate = (dateStr: string | Date): string => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Returns color codes based on ATS score values
 */
export const getScoreColor = (score: number) => {
  if (score >= 70) {
    return {
      text: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      border: "border-emerald-200 dark:border-emerald-800",
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
      hex: "#10B981",
    };
  } else if (score >= 50) {
    return {
      text: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-800",
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]",
      hex: "#F59E0B",
    };
  } else {
    return {
      text: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-950/40",
      border: "border-rose-200 dark:border-rose-800",
      glow: "shadow-[0_0_15px_rgba(239,68,68,0.2)]",
      hex: "#EF4444",
    };
  }
};

/**
 * Returns shortlist probability text formatting
 */
export const getShortlistColor = (prob: string) => {
  switch (prob) {
    case "Very High":
    case "High":
      return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/45 border-emerald-200 dark:border-emerald-800";
    case "Medium":
      return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/45 border-amber-200 dark:border-amber-800";
    case "Low":
    case "Very Low":
    default:
      return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/45 border-rose-200 dark:border-rose-800";
  }
};
