import React from "react";
import { FileCheck2, UploadCloud } from "lucide-react";

interface HeaderProps {
  onNewAnalysis: () => void;
  hasActiveResume: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewAnalysis,
  hasActiveResume,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNewAnalysis}>
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                AI Resume Checker
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              ATS Scoring, Keyword Match & Impact Rewriter
            </p>
          </div>
        </div>

        {/* Right CTA */}
        {hasActiveResume && (
          <button
            type="button"
            onClick={onNewAnalysis}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            <span>Upload Another Resume</span>
          </button>
        )}
      </div>
    </header>
  );
};
