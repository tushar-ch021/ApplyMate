import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Save, Check, Plus, Trash2, Edit2, AlertCircle, Maximize2, Minimize2 } from "lucide-react";

interface ResumeEditorProps {
  originalText: string;
  optimizedData: any;
  onSave: (updatedData: any) => Promise<void>;
  onAIEdit: (sectionName: string, sectionContent: string) => void;
  isSavingExternal?: boolean;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  originalText = "",
  optimizedData,
  onSave,
  onAIEdit,
  isSavingExternal = false,
  isMaximized = false,
  onToggleMaximize,
}) => {
  const [resume, setResume] = useState<any>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [localSaving, setLocalSaving] = useState<boolean>(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize state when optimizedData changes
  useEffect(() => {
    if (optimizedData) {
      setResume(JSON.parse(JSON.stringify(optimizedData))); // Deep copy
      setIsDirty(false);
    }
  }, [optimizedData]);

  // Debounced Auto-Save Handler (2 seconds)
  useEffect(() => {
    if (!isDirty || !resume) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      setLocalSaving(true);
      await onSave(resume);
      setIsDirty(false);
      setLocalSaving(false);
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [resume, isDirty, onSave]);

  if (!resume) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
        <p className="text-sm text-gray-500">Please run the "Optimize Resume" process to load the interactive builder.</p>
      </div>
    );
  }

  // Handle value modifications
  const updateField = (path: string[], value: any) => {
    setIsDirty(true);
    setResume((prev: any) => {
      const copy = { ...prev };
      let current = copy;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return copy;
    });
  };

  const handleManualSave = async () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setLocalSaving(true);
    await onSave(resume);
    setIsDirty(false);
    setLocalSaving(false);
  };

  // Helper arrays for experience & projects
  const experiences = resume.experience || [];
  const projects = resume.projects || [];
  const educations = resume.education || [];
  const certifications = resume.certifications || [];
  const skills = resume.skills || { languages: [], frameworks: [], databases: [], tools: [], concepts: [] };

  return (
    <div className={isMaximized ? "flex-1 flex flex-col h-full overflow-hidden space-y-4" : "space-y-6"}>
      {/* 1. Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shrink-0">
        <div className="flex items-center gap-2">
          {isDirty ? (
            <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
              <AlertCircle className="h-3.5 w-3.5 animate-pulse" />
              Unsaved changes (auto-saving in 2s...)
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
              <Check className="h-3.5 w-3.5" />
              All changes saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onToggleMaximize && (
            <button
              onClick={onToggleMaximize}
              className="p-1 px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white cursor-pointer flex items-center gap-1 text-[10px] font-bold shadow-xs transition-colors"
              title={isMaximized ? "Minimize Editor" : "Maximize Editor"}
            >
              {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              <span>{isMaximized ? "Minimize" : "Maximize"}</span>
            </button>
          )}
          <button
            onClick={handleManualSave}
            disabled={!isDirty || localSaving || isSavingExternal}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all`}
          >
            <Save className="h-3 w-3" />
            {localSaving || isSavingExternal ? "Saving..." : "Save Now"}
          </button>
        </div>
      </div>

      {/* 2. Split Workspace Layout */}
      <div className={isMaximized ? "flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden min-h-0" : "grid grid-cols-1 lg:grid-cols-12 gap-6"}>
        {/* Left Side: Greyed-out Original */}
        <div className={isMaximized ? "lg:col-span-4 flex flex-col h-full overflow-hidden space-y-3" : "lg:col-span-4 space-y-3"}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 shrink-0">
            Original Text (Read-Only)
          </h4>
          <div className={isMaximized ? "flex-1 overflow-y-auto p-4 rounded-lg bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-900 text-[10px] leading-relaxed text-gray-400 select-none font-mono" : "h-[500px] overflow-y-auto p-4 rounded-lg bg-gray-50 dark:bg-gray-950/40 border border-gray-100 dark:border-gray-900 text-[10px] leading-relaxed text-gray-400 select-none font-mono"}>
            {originalText}
          </div>
        </div>

        {/* Right Side: Interactive Form Editor */}
        <div className={isMaximized ? "lg:col-span-8 flex flex-col h-full overflow-y-auto pr-2 pb-16 space-y-6 min-h-0" : "lg:col-span-8 space-y-6"}>
          {/* --- CONTACT SECTION --- */}
          <div className="p-5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all shadow-sm space-y-4 group">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-gray-800">
              <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white uppercase">
                Contact Details
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={resume.name || ""}
                  onChange={(e) => updateField(["name"], e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={resume.contact?.email || ""}
                  onChange={(e) => updateField(["contact", "email"], e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Phone</label>
                <input
                  type="text"
                  value={resume.contact?.phone || ""}
                  onChange={(e) => updateField(["contact", "phone"], e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">Location</label>
                <input
                  type="text"
                  value={resume.contact?.location || ""}
                  onChange={(e) => updateField(["contact", "location"], e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">LinkedIn</label>
                <input
                  type="text"
                  value={resume.contact?.linkedin || ""}
                  onChange={(e) => updateField(["contact", "linkedin"], e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-400 mb-1">GitHub</label>
                <input
                  type="text"
                  value={resume.contact?.github || ""}
                  onChange={(e) => updateField(["contact", "github"], e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* --- PROFESSIONAL SUMMARY --- */}
          <div className="p-5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all shadow-sm space-y-3 group">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-gray-800">
              <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white uppercase">
                Professional Summary
              </h3>
              <button
                onClick={() => onAIEdit("Professional Summary", resume.summary)}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/70 border border-blue-200/50 dark:border-blue-900/50 cursor-pointer transition-colors"
              >
                <Sparkles className="h-2.5 w-2.5" />
                AI Edit
              </button>
            </div>
            <textarea
              rows={4}
              value={resume.summary || ""}
              onChange={(e) => updateField(["summary"], e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-xs leading-relaxed text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* --- TECHNICAL SKILLS --- */}
          <div className="p-5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all shadow-sm space-y-3 group">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-gray-800">
              <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white uppercase">
                Technical Skills
              </h3>
              <button
                onClick={() => onAIEdit("Technical Skills", JSON.stringify(skills))}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/70 border border-blue-200/50 dark:border-blue-900/50 cursor-pointer transition-colors"
              >
                <Sparkles className="h-2.5 w-2.5" />
                AI Edit
              </button>
            </div>
            <div className="space-y-3 text-xs">
              {Object.keys(skills).map((key) => {
                const list = skills[key] || [];
                return (
                  <div key={key} className="space-y-1">
                    <label className="block font-semibold capitalize text-gray-500 dark:text-gray-400">
                      {key.replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      type="text"
                      value={list.join(", ")}
                      onChange={(e) =>
                        updateField(
                          ["skills", key],
                          e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                        )
                      }
                      className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500"
                      placeholder="Separate with commas"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- EXPERIENCE SECTION --- */}
          <div className="p-5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all shadow-sm space-y-4 group">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-gray-800">
              <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white uppercase">
                Professional Experience
              </h3>
              <button
                onClick={() => onAIEdit("Professional Experience", JSON.stringify(experiences))}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/70 border border-blue-200/50 dark:border-blue-900/50 cursor-pointer transition-colors"
              >
                <Sparkles className="h-2.5 w-2.5" />
                AI Edit
              </button>
            </div>
            
            <div className="space-y-6">
              {experiences.map((exp: any, expIdx: number) => (
                <div
                  key={`exp-${expIdx}`}
                  className="p-4 rounded border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30 space-y-3 relative group/item"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-400 mb-1">Role Title</label>
                      <input
                        type="text"
                        value={exp.title || ""}
                        onChange={(e) => {
                          const list = [...experiences];
                          list[expIdx].title = e.target.value;
                          updateField(["experience"], list);
                        }}
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company || ""}
                        onChange={(e) => {
                          const list = [...experiences];
                          list[expIdx].company = e.target.value;
                          updateField(["experience"], list);
                        }}
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate || ""}
                        onChange={(e) => {
                          const list = [...experiences];
                          list[expIdx].startDate = e.target.value;
                          updateField(["experience"], list);
                        }}
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">End Date</label>
                      <input
                        type="text"
                        value={exp.endDate || ""}
                        onChange={(e) => {
                          const list = [...experiences];
                          list[expIdx].endDate = e.target.value;
                          updateField(["experience"], list);
                        }}
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Responsibility Bullets
                    </label>
                    {(exp.bullets || []).map((bullet: string, bulletIdx: number) => (
                      <div key={`bullet-${expIdx}-${bulletIdx}`} className="flex items-start gap-2">
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => {
                            const list = [...experiences];
                            list[expIdx].bullets[bulletIdx] = e.target.value;
                            updateField(["experience"], list);
                          }}
                          className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-xs leading-relaxed text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => {
                            const list = [...experiences];
                            list[expIdx].bullets.splice(bulletIdx, 1);
                            updateField(["experience"], list);
                          }}
                          className="p-1.5 rounded bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/40 text-rose-500 border border-rose-100 dark:border-rose-900/50 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const list = [...experiences];
                        if (!list[expIdx].bullets) list[expIdx].bullets = [];
                        list[expIdx].bullets.push("Action Verb + Task completed + Tech context + Quantified outcome.");
                        updateField(["experience"], list);
                      }}
                      className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/55 dark:bg-blue-950/20 hover:bg-blue-100/55 p-1.5 rounded border border-blue-100 dark:border-blue-900/30 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      Add Bullet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- PROJECTS SECTION --- */}
          <div className="p-5 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-all shadow-sm space-y-4 group">
            <div className="flex items-center justify-between pb-2 border-b border-gray-50 dark:border-gray-800">
              <h3 className="text-sm font-bold tracking-tight text-gray-900 dark:text-white uppercase">
                Key Projects
              </h3>
              <button
                onClick={() => onAIEdit("Key Projects", JSON.stringify(projects))}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-950/70 border border-blue-200/50 dark:border-blue-900/50 cursor-pointer transition-colors"
              >
                <Sparkles className="h-2.5 w-2.5" />
                AI Edit
              </button>
            </div>

            <div className="space-y-6">
              {projects.map((proj: any, projIdx: number) => (
                <div
                  key={`proj-${projIdx}`}
                  className="p-4 rounded border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30 space-y-3 relative"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-gray-400 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={proj.name || ""}
                        onChange={(e) => {
                          const list = [...projects];
                          list[projIdx].name = e.target.value;
                          updateField(["projects"], list);
                        }}
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Tech Stack</label>
                      <input
                        type="text"
                        value={Array.isArray(proj.tech) ? proj.tech.join(", ") : ""}
                        onChange={(e) => {
                          const list = [...projects];
                          list[projIdx].tech = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                          updateField(["projects"], list);
                        }}
                        className="w-full p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                        placeholder="Separate with commas"
                      />
                    </div>
                  </div>

                  {/* Bullet Points */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Project Description Bullets
                    </label>
                    {(proj.bullets || []).map((bullet: string, bulletIdx: number) => (
                      <div key={`bullet-proj-${projIdx}-${bulletIdx}`} className="flex items-start gap-2">
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => {
                            const list = [...projects];
                            list[projIdx].bullets[bulletIdx] = e.target.value;
                            updateField(["projects"], list);
                          }}
                          className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded text-xs leading-relaxed text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => {
                            const list = [...projects];
                            list[projIdx].bullets.splice(bulletIdx, 1);
                            updateField(["projects"], list);
                          }}
                          className="p-1.5 rounded bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-900/40 text-rose-500 border border-rose-100 dark:border-rose-900/50 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const list = [...projects];
                        if (!list[projIdx].bullets) list[projIdx].bullets = [];
                        list[projIdx].bullets.push("Engineered a feature that solves a user challenge.");
                        updateField(["projects"], list);
                      }}
                      className="flex items-center gap-1 text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/55 dark:bg-blue-950/20 hover:bg-blue-100/55 p-1.5 rounded border border-blue-100 dark:border-blue-900/30 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      Add Bullet
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- EDUCATION & CERTIFICATIONS SUMMARY SQUARES --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* EDUCATION */}
            <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Education
              </h3>
              {educations.map((edu: any, index: number) => (
                <div key={`edu-${index}`} className="space-y-2 text-xs">
                  <input
                    type="text"
                    value={edu.degree || ""}
                    placeholder="Degree"
                    onChange={(e) => {
                      const list = [...educations];
                      list[index].degree = e.target.value;
                      updateField(["education"], list);
                    }}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded focus:outline-none"
                  />
                  <input
                    type="text"
                    value={edu.institution || ""}
                    placeholder="Institution"
                    onChange={(e) => {
                      const list = [...educations];
                      list[index].institution = e.target.value;
                      updateField(["education"], list);
                    }}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* CERTIFICATIONS */}
            <div className="p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Certifications
              </h3>
              {certifications.map((cert: any, index: number) => (
                <div key={`cert-${index}`} className="space-y-2 text-xs">
                  <input
                    type="text"
                    value={cert.name || ""}
                    placeholder="Certification Name"
                    onChange={(e) => {
                      const list = [...certifications];
                      list[index].name = e.target.value;
                      updateField(["certifications"], list);
                    }}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded focus:outline-none"
                  />
                  <input
                    type="text"
                    value={cert.issuer || ""}
                    placeholder="Issuer"
                    onChange={(e) => {
                      const list = [...certifications];
                      list[index].issuer = e.target.value;
                      updateField(["certifications"], list);
                    }}
                    className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;
