import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Sparkles, ArrowRight, ShieldCheck, FileCheck, Brain, Briefcase } from "lucide-react";

export const Landing: React.FC = () => {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col justify-between">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              ApplyMate
            </span>
          </div>

          <div className="flex items-center gap-3">
            {token ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-1"
              >
                Go to Dashboard
                <ArrowRight className="h-3 w-3" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 max-w-5xl mx-auto text-center space-y-12">
        {/* Animated Feature Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          Next-Gen Gemini AI Resume Optimization
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-4xl leading-[1.1] font-sans">
          Audit and Optimize Your Resume for <span className="text-blue-600 dark:text-blue-400">Modern ATS Systems</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-base sm:text-lg text-gray-400 dark:text-gray-500 leading-relaxed font-sans">
          ApplyMate uses advanced semantic analysis to compare your resume against target Job Descriptions, align keywords honestly, write custom cover letters, and coach you for interviews.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to={token ? "/dashboard" : "/register"}
            className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/15 flex items-center gap-1.5 cursor-pointer"
          >
            Start Analyzing Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="#features"
            className="px-6 py-3.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all cursor-pointer"
          >
            Explore Capabilities
          </a>
        </div>

        {/* Decorative Grid Panel */}
        <div className="w-full pt-12 relative">
          <div className="absolute inset-0 bg-radial-gradient from-blue-500/10 to-transparent blur-3xl -z-10" />
          <div className="rounded-2xl border border-gray-150 dark:border-gray-800/80 bg-white/60 dark:bg-gray-900/40 p-6 shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-6 text-left">
            <div className="flex-1 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-500">Live Workspace Mockup</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Dual-Panel Performance Suite</h3>
              <p className="text-xs text-gray-400">Experience a complete inline builder containing scoring matrices, matching badge filters, cover letters, and STAR-based interview coaching in a single window.</p>
            </div>
            <div className="h-40 w-full md:w-80 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-100 dark:border-gray-900/60 p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-900 pb-2">
                <span className="text-[10px] font-semibold text-gray-400">ATS Match Analysis</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-end gap-2 sm:gap-3 pt-4">
                <div className="h-24 w-8 sm:w-12 rounded bg-gray-100 dark:bg-gray-900 flex flex-col justify-end">
                  <div className="h-1/2 w-full bg-rose-500/40 rounded-b" />
                </div>
                <div className="h-24 w-8 sm:w-12 rounded bg-gray-100 dark:bg-gray-900 flex flex-col justify-end">
                  <div className="h-3/4 w-full bg-amber-500/40 rounded-b" />
                </div>
                <div className="h-24 w-8 sm:w-12 rounded bg-gray-100 dark:bg-gray-900 flex flex-col justify-end">
                  <div className="h-full w-full bg-emerald-500 rounded-b shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse" />
                </div>
                <div className="flex-1 pb-1">
                  <span className="text-2xl font-bold">85%</span>
                  <span className="block text-[9px] text-gray-400">Target Score Project</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-white dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Engineered For Quick Placements</h2>
            <p className="text-sm text-gray-400">Everything you need to bypass applicant tracking filters and secure hiring call-backs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm space-y-4">
              <div className="h-10 w-10 rounded bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">ATS Semantic Score</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Runs semantic evaluation against key-terms, scoring your resume and drawing interactive gap-analysis matrices.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm space-y-4">
              <div className="h-10 w-10 rounded bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">Honest Optimization</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Improves vocab alignment and phrasing without fabricating mock accomplishments, metrics, or certifications.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm space-y-4">
              <div className="h-10 w-10 rounded bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">STAR Interview Prep</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Auto-compiles relevant technical questions and shapes behavioral STAR models from actual project timelines.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50 shadow-sm space-y-4">
              <div className="h-10 w-10 rounded bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">Professional Cover Letters</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Drafts matching cover letters aligning with company specifications in Professional, Friendly, or Concise tones.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-150 dark:border-gray-900 bg-white dark:bg-gray-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-400">
          <p>© 2026 ApplyMate AI Resume Optimizer. Tushar Chaudhary Licensed. </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
