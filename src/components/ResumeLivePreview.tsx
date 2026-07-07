import React from "react";

interface ResumeLivePreviewProps {
  resume: any;
  theme: string;
  spacing: "snug" | "normal" | "loose";
}

export const ResumeLivePreview: React.FC<ResumeLivePreviewProps> = ({
  resume,
  theme = "classic",
  spacing = "normal",
}) => {
  if (!resume) return null;

  const experiences = resume.experience || [];
  const projects = resume.projects || [];
  const educations = resume.education || [];
  const certifications = resume.certifications || [];
  const skills = resume.skills || { languages: [], frameworks: [], databases: [], tools: [], concepts: [] };

  // Spacing class mapping
  const spacingClasses = {
    snug: {
      sectionGap: "space-y-3.5",
      itemGap: "space-y-1.5",
      textPadding: "py-0.5",
      lineHeight: "leading-normal",
    },
    normal: {
      sectionGap: "space-y-5",
      itemGap: "space-y-3",
      textPadding: "py-1.5",
      lineHeight: "leading-relaxed",
    },
    loose: {
      sectionGap: "space-y-7",
      itemGap: "space-y-4.5",
      textPadding: "py-2.5",
      lineHeight: "leading-loose",
    },
  }[spacing];

  // Theme color maps
  const themeStyles: Record<string, {
    fontFamily: string;
    headerColor: string;
    accentColor: string;
    titleColor: string;
    badgeStyle: string;
    borderAccent: string;
    bulletStyle: string;
  }> = {
    classic: {
      fontFamily: "font-sans",
      headerColor: "text-[#1A3C5E] dark:text-[#60A5FA]",
      accentColor: "border-[#1A3C5E]/30 dark:border-[#60A5FA]/30",
      titleColor: "text-gray-900 dark:text-white",
      badgeStyle: "bg-blue-50 text-[#1A3C5E] dark:bg-blue-950/40 dark:text-blue-300 border border-blue-150/30",
      borderAccent: "border-l-4 border-l-[#1A3C5E] pl-2",
      bulletStyle: "bg-[#1A3C5E]/80 dark:bg-blue-400",
    },
    modern: {
      fontFamily: "font-sans tracking-tight",
      headerColor: "text-[#0D9488] dark:text-[#2DD4BF]",
      accentColor: "border-[#0D9488]/30 dark:border-[#2DD4BF]/30",
      titleColor: "text-gray-900 dark:text-white",
      badgeStyle: "bg-teal-50 text-[#0D9488] dark:bg-teal-950/40 dark:text-teal-300 border border-teal-150/30",
      borderAccent: "border-l-4 border-l-[#0D9488] pl-2",
      bulletStyle: "bg-[#0D9488]/80 dark:bg-teal-400",
    },
    minimalist: {
      fontFamily: "font-serif",
      headerColor: "text-gray-900 dark:text-gray-100",
      accentColor: "border-gray-900/30 dark:border-gray-100/30",
      titleColor: "text-gray-950 dark:text-white",
      badgeStyle: "bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-300/20",
      borderAccent: "border-l border-l-gray-400 dark:border-l-gray-600 pl-2",
      bulletStyle: "bg-gray-800 dark:bg-gray-350",
    },
    creative: {
      fontFamily: "font-sans",
      headerColor: "text-[#9D174D] dark:text-[#F43F5E]",
      accentColor: "border-[#9D174D]/30 dark:border-[#F43F5E]/30",
      titleColor: "text-gray-900 dark:text-white",
      badgeStyle: "bg-pink-50 text-[#9D174D] dark:bg-pink-950/45 dark:text-pink-300 border border-pink-150/30",
      borderAccent: "border-l-4 border-l-[#9D174D] pl-2",
      bulletStyle: "bg-[#9D174D]/80 dark:bg-pink-400",
    },
  };

  const style = themeStyles[theme] || themeStyles.classic;

  return (
    <div
      id="live-resume-preview-sheet"
      className={`w-full bg-white dark:bg-gray-950 p-6 sm:p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-md ${style.fontFamily} ${spacingClasses.lineHeight} transition-all duration-300 max-h-[750px] overflow-y-auto`}
    >
      {/* 1. HEADER SECTION */}
      <div className="text-center pb-5 border-b border-gray-100 dark:border-gray-900 space-y-1.5">
        <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${style.titleColor}`}>
          {resume.name}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium font-mono">
          <span>{resume.contact?.email}</span>
          <span>•</span>
          <span>{resume.contact?.phone}</span>
          <span>•</span>
          <span>{resume.contact?.location}</span>
          {resume.contact?.linkedin && (
            <>
              <span>•</span>
              <span className="truncate max-w-[120px]">{resume.contact.linkedin}</span>
            </>
          )}
          {resume.contact?.github && (
            <>
              <span>•</span>
              <span className="truncate max-w-[120px]">{resume.contact.github}</span>
            </>
          )}
        </div>
      </div>

      {/* 2. BODY CONTENT */}
      <div className={`mt-5 ${spacingClasses.sectionGap}`}>
        {/* SUMMARY */}
        {resume.summary && (
          <div className="space-y-1.5">
            <h3 className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-widest ${style.headerColor} border-b pb-1 ${style.accentColor}`}>
              Professional Summary
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 text-justify">
              {resume.summary}
            </p>
          </div>
        )}

        {/* SKILLS */}
        {Object.values(skills).some((arr: any) => arr && arr.length > 0) && (
          <div className="space-y-2">
            <h3 className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-widest ${style.headerColor} border-b pb-1 ${style.accentColor}`}>
              Technical Skills
            </h3>
            <div className="space-y-1.5 text-xs">
              {Object.keys(skills).map((key) => {
                const list = skills[key] || [];
                if (list.length === 0) return null;
                return (
                  <div key={key} className="grid grid-cols-1 sm:grid-cols-12 gap-1 items-start">
                    <span className="sm:col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <div className="sm:col-span-9 flex flex-wrap gap-1">
                      {list.map((item: string, i: number) => (
                        <span
                          key={i}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${style.badgeStyle}`}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EXPERIENCE */}
        {experiences.length > 0 && (
          <div className="space-y-3">
            <h3 className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-widest ${style.headerColor} border-b pb-1 ${style.accentColor}`}>
              Professional Experience
            </h3>
            <div className={spacingClasses.itemGap}>
              {experiences.map((exp: any, idx: number) => (
                <div key={idx} className={`space-y-1.5 ${style.borderAccent}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {exp.title} <span className="font-normal text-gray-400">at</span> {exp.company}
                    </h4>
                    <span className="text-[10px] font-bold text-gray-400 font-mono">
                      {exp.startDate} – {exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                      {exp.location}
                    </div>
                  )}
                  <ul className="space-y-1 text-xs text-gray-650 dark:text-gray-300 list-none pl-1">
                    {(exp.bullets || []).map((bullet: string, i: number) => (
                      <li key={i} className="relative pl-3.5 leading-relaxed text-justify">
                        <span className={`absolute left-0 top-[6px] h-1.5 w-1.5 rounded-full ${style.bulletStyle}`} />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {projects.length > 0 && (
          <div className="space-y-3">
            <h3 className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-widest ${style.headerColor} border-b pb-1 ${style.accentColor}`}>
              Key Projects
            </h3>
            <div className={spacingClasses.itemGap}>
              {projects.map((proj: any, idx: number) => (
                <div key={idx} className={`space-y-1.5 ${style.borderAccent}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      {proj.name}
                    </h4>
                    {proj.tech && proj.tech.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {proj.tech.map((t: string, i: number) => (
                          <span key={i} className="text-[8px] font-bold text-gray-400 border border-gray-200 dark:border-gray-800 px-1 py-0.2 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ul className="space-y-1 text-xs text-gray-650 dark:text-gray-300 list-none pl-1">
                    {(proj.bullets || []).map((bullet: string, i: number) => (
                      <li key={i} className="relative pl-3.5 leading-relaxed text-justify">
                        <span className={`absolute left-0 top-[6px] h-1.5 w-1.5 rounded-full ${style.bulletStyle}`} />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDUCATION & CERTIFICATIONS COMBINED IF BOTH EXIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {educations.length > 0 && (
            <div className="space-y-1.5">
              <h3 className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-widest ${style.headerColor} border-b pb-1 ${style.accentColor}`}>
                Education
              </h3>
              <div className="space-y-2">
                {educations.map((edu: any, idx: number) => (
                  <div key={idx} className="text-xs space-y-0.5">
                    <div className="font-bold text-gray-800 dark:text-white">{edu.degree}</div>
                    <div className="text-gray-500">{edu.institution} {edu.location && `| ${edu.location}`}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{edu.graduation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certifications.length > 0 && (
            <div className="space-y-1.5">
              <h3 className={`text-[11px] sm:text-xs font-extrabold uppercase tracking-widest ${style.headerColor} border-b pb-1 ${style.accentColor}`}>
                Certifications
              </h3>
              <div className="space-y-2">
                {certifications.map((cert: any, idx: number) => (
                  <div key={idx} className="text-xs space-y-0.5">
                    <div className="font-bold text-gray-800 dark:text-white">{cert.name}</div>
                    <div className="text-gray-500">{cert.issuer}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{cert.date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeLivePreview;
