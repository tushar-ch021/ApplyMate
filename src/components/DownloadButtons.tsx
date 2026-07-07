import React, { useState } from "react";
import { FileText, Download, Loader2, Palette, Info } from "lucide-react";
import { resumeAPI } from "../services/api";
import toast from "react-hot-toast";

interface DownloadButtonsProps {
  resumeJson: any;
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({ resumeJson }) => {
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [docxLoading, setDocxLoading] = useState<boolean>(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("classic");

  const themes = [
    {
      id: "classic",
      name: "Classic",
      description: "Deep Navy & Slate (Corporate standard)",
      primaryBg: "bg-[#1A3C5E]",
      secondaryBg: "bg-[#2E6DA4]",
    },
    {
      id: "modern",
      name: "Modern",
      description: "Vibrant Teal & Charcoal (Tech-focused)",
      primaryBg: "bg-[#0D9488]",
      secondaryBg: "bg-[#0F766E]",
    },
    {
      id: "minimalist",
      name: "Minimalist",
      description: "Monochrome & Times-Roman (Clean, elegant)",
      primaryBg: "bg-[#111827]",
      secondaryBg: "bg-[#6B7280]",
    },
    {
      id: "creative",
      name: "Creative",
      description: "Ruby & Rose (Expressive layouts)",
      primaryBg: "bg-[#9D174D]",
      secondaryBg: "bg-[#BE185D]",
    },
  ];

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = async () => {
    if (!resumeJson) return;
    setPdfLoading(true);
    try {
      const blob = await resumeAPI.downloadPDF(resumeJson, selectedTheme);
      const safeName = (resumeJson.name || "Resume").replace(/[^a-zA-Z0-9]/g, "_");
      triggerDownload(blob, `${safeName}_Resume_${selectedTheme}.pdf`);
      toast.success(`${themes.find(t => t.id === selectedTheme)?.name} PDF downloaded successfully!`);
    } catch (err: any) {
      console.error("PDF download error:", err);
      toast.error(err.message || "Failed to download PDF resume.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadDOCX = async () => {
    if (!resumeJson) return;
    setDocxLoading(true);
    try {
      const blob = await resumeAPI.downloadDOCX(resumeJson, selectedTheme);
      const safeName = (resumeJson.name || "Resume").replace(/[^a-zA-Z0-9]/g, "_");
      triggerDownload(blob, `${safeName}_Resume_${selectedTheme}.docx`);
      toast.success(`${themes.find(t => t.id === selectedTheme)?.name} Word Document downloaded successfully!`);
    } catch (err: any) {
      console.error("DOCX download error:", err);
      toast.error(err.message || "Failed to download Word resume.");
    } finally {
      setDocxLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Visual Theme Selection Row */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5 text-blue-500" />
          Select Resume Visual Theme
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {themes.map((t) => {
            const isSelected = selectedTheme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTheme(t.id)}
                className={`relative p-2.5 text-left rounded-xl border text-xs cursor-pointer transition-all duration-200 flex flex-col justify-between h-20 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm"
                    : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900"
                }`}
              >
                {/* Visual Swatch Pill */}
                <div className="flex items-center gap-1">
                  <span className={`h-3 w-3 rounded-full ${t.primaryBg} inline-block`} />
                  <span className={`h-3 w-1.5 rounded-full ${t.secondaryBg} inline-block`} />
                </div>
                
                <div className="mt-2">
                  <p className="font-bold text-gray-950 dark:text-white text-[11px]">
                    {t.name}
                  </p>
                  <p className="text-[9px] text-gray-400 dark:text-gray-500 truncate w-full">
                    {t.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Export Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {/* 1. PDF Download */}
        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading || docxLoading}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 cursor-pointer transition-all shadow-sm"
        >
          {pdfLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {pdfLoading ? "Compiling PDF..." : `Export PDF (${themes.find(t => t.id === selectedTheme)?.name})`}
        </button>

        {/* 2. DOCX Download */}
        <button
          onClick={handleDownloadDOCX}
          disabled={pdfLoading || docxLoading}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-all shadow-sm"
        >
          {docxLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {docxLoading ? "Formatting Word..." : `Export Word (${themes.find(t => t.id === selectedTheme)?.name})`}
        </button>
      </div>
    </div>
  );
};

export default DownloadButtons;
