import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

interface UploadSectionProps {
  onFileUpload: (file: File, targetRole?: string, targetJobDescription?: string) => Promise<void>;
  onTextSubmit: (text: string, filename?: string, targetRole?: string, targetJobDescription?: string) => Promise<void>;
  onLoadSample: (sampleType: string) => Promise<void>;
  isLoading: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onFileUpload,
  onTextSubmit,
  onLoadSample,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<"file" | "text">("file");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Paste text state
  const [pastedText, setPastedText] = useState("");
  const [resumeTitle, setResumeTitle] = useState("");

  // Target job optional fields
  const [showJobMatching, setShowJobMatching] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [targetJobDescription, setTargetJobDescription] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAnalyzeClick = async () => {
    if (activeTab === "file" && selectedFile) {
      await onFileUpload(selectedFile, targetRole, targetJobDescription);
    } else if (activeTab === "text" && pastedText.trim().length >= 50) {
      await onTextSubmit(
        pastedText.trim(),
        resumeTitle.trim() || "Pasted_Resume.txt",
        targetRole,
        targetJobDescription
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
      {/* Tab bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("file")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "file"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Upload File (.PDF, .TXT)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("text")}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "text"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Paste Resume Text
          </button>
        </div>

        {/* Sample Resumes Dropdown / Quick Links */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">Try Sample:</span>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onLoadSample("fullstack")}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors disabled:opacity-50"
          >
            Full-Stack Dev
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onLoadSample("product-manager")}
            className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold transition-colors disabled:opacity-50"
          >
            Product Lead
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => onLoadSample("marketing")}
            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold transition-colors disabled:opacity-50"
          >
            Marketing
          </button>
        </div>
      </div>

      {/* Main Upload / Input Area */}
      {activeTab === "file" ? (
        <div>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
              isDragging
                ? "border-indigo-500 bg-indigo-50/50 scale-[1.01]"
                : selectedFile
                ? "border-emerald-400 bg-emerald-50/20"
                : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md,application/pdf,text/plain"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                  selectedFile
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-indigo-50 text-indigo-600"
                }`}
              >
                {selectedFile ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>

              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-slate-900">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(selectedFile.size / 1024).toFixed(1)} KB · Ready to evaluate ATS score
                  </p>
                  <span className="inline-block mt-2 text-xs font-semibold text-indigo-600 hover:underline">
                    Click to choose a different file
                  </span>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Click or drag & drop your resume file here
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports text-based PDF, TXT, and Markdown (Max 5MB)
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                      Workday
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                      Greenhouse
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                      Taleo
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                      Lever
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            placeholder="Candidate / Resume Name (e.g., Jane_Doe_Resume)"
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
          />
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={8}
            placeholder="Paste your raw resume text here (experience, skills, education, summary)..."
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white font-mono text-xs text-slate-800 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Minimum 50 characters</span>
            <span className="font-mono">{pastedText.length} chars</span>
          </div>
        </div>
      )}

      {/* Target Job Description Collapsible Accordion */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowJobMatching(!showJobMatching)}
          className="flex items-center justify-between w-full text-left text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            <span>Target Job Matching (Optional · Tailor ATS score to a specific job)</span>
          </div>
          {showJobMatching ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showJobMatching && (
          <div className="mt-4 space-y-3 pl-6 border-l-2 border-indigo-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Role Title
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Software Engineer, Lead Product Designer..."
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Job Description / Requirements
              </label>
              <textarea
                value={targetJobDescription}
                onChange={(e) => setTargetJobDescription(e.target.value)}
                rows={4}
                placeholder="Paste the job posting requirements here. Gemini will calculate keyword density match and identify missing prerequisite qualifications."
                className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono text-slate-800"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit CTA */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span>Analyzed with Gemini 3.8 Flash ATS algorithmic model</span>
        </div>

        <button
          type="button"
          disabled={
            isLoading ||
            (activeTab === "file" && !selectedFile) ||
            (activeTab === "text" && pastedText.trim().length < 50)
          }
          onClick={handleAnalyzeClick}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-extrabold shadow-md disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Scanning ATS Rules & Keywords...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Run Complete ATS Analysis
            </>
          )}
        </button>
      </div>

      {/* Mobile sample buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex sm:hidden flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400 font-medium">Or try sample:</span>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onLoadSample("fullstack")}
          className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold"
        >
          Full-Stack Dev
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onLoadSample("product-manager")}
          className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold"
        >
          Product Lead
        </button>
      </div>
    </div>
  );
};
