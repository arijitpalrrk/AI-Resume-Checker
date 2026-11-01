import React, { useState } from "react";
import { ResumeRecord } from "./types.js";
import {
  uploadResumeFile,
  analyzeResumeText,
  applyRewrites,
  manualEditResume,
  loadSampleResume,
} from "./services/api.js";
import { Header } from "./components/Header.js";
import { ScoreGauge } from "./components/ScoreGauge.js";
import { ScoreBreakdown } from "./components/ScoreBreakdown.js";
import { RewritesSection } from "./components/RewritesSection.js";
import { IssuesSection } from "./components/IssuesSection.js";
import { KeywordsSection } from "./components/KeywordsSection.js";
import { VersionDiffViewer } from "./components/VersionDiffViewer.js";
import { ResumeTextEditor } from "./components/ResumeTextEditor.js";
import { UploadSection } from "./components/UploadSection.js";
import {
  Sparkles,
  FileText,
  AlertTriangle,
  Layers,
  ArrowLeftRight,
  Code2,
  UploadCloud,
} from "lucide-react";

export default function App() {
  const [current, setCurrent] = useState<ResumeRecord | null>(null);
  const [vIndex, setVIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"overview" | "diff" | "text">("overview");

  const handleFileUpload = async (
    file: File,
    targetRole?: string,
    targetJobDescription?: string
  ) => {
    setLoading(true);
    setLoadingStep("Extracting text and structure...");
    setError("");

    const timer1 = setTimeout(() => {
      setLoadingStep("Evaluating against ATS screening rules...");
    }, 1500);

    const timer2 = setTimeout(() => {
      setLoadingStep("Generating quantified bullet rewrites with Gemini...");
    }, 3500);

    try {
      const record = await uploadResumeFile(file, targetRole, targetJobDescription);
      setCurrent(record);
      setVIndex(record.versions.length - 1);
      setActiveTab("overview");
    } catch (err: any) {
      setError(err.message || "Failed to analyze resume");
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleTextSubmit = async (
    text: string,
    filename?: string,
    targetRole?: string,
    targetJobDescription?: string
  ) => {
    setLoading(true);
    setLoadingStep("Parsing resume text and structure...");
    setError("");

    const timer = setTimeout(() => {
      setLoadingStep("Calculating ATS score and keyword density...");
    }, 1500);

    try {
      const record = await analyzeResumeText(text, filename, targetRole, targetJobDescription);
      setCurrent(record);
      setVIndex(record.versions.length - 1);
      setActiveTab("overview");
    } catch (err: any) {
      setError(err.message || "Failed to analyze resume text");
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleLoadSample = async (sampleType: string) => {
    setLoading(true);
    setLoadingStep("Loading sample resume evaluation...");
    setError("");
    try {
      const record = await loadSampleResume(sampleType);
      setCurrent(record);
      setVIndex(record.versions.length - 1);
      setActiveTab("overview");
    } catch (err: any) {
      setError(err.message || "Failed to load sample resume");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleApplyRewrites = async (
    selectedIds: string[],
    customEdits: Record<string, string>
  ) => {
    if (!current) return;
    setLoading(true);
    setLoadingStep("Applying selected rewrites & recalculating ATS score...");
    setError("");
    try {
      const updated = await applyRewrites(current.id, selectedIds, customEdits);
      setCurrent(updated);
      setVIndex(updated.versions.length - 1);
    } catch (err: any) {
      setError(err.message || "Failed to apply rewrites");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleSaveManualEdit = async (newText: string) => {
    if (!current) return;
    setLoading(true);
    setLoadingStep("Re-evaluating edited resume with Gemini ATS engine...");
    setError("");
    try {
      const updated = await manualEditResume(current.id, newText);
      setCurrent(updated);
      setVIndex(updated.versions.length - 1);
    } catch (err: any) {
      setError(err.message || "Failed to save edited resume");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const currentVersion = current?.versions[vIndex];
  const analysis = currentVersion?.analysis;
  const previousVersion = vIndex > 0 ? current?.versions[vIndex - 1] : undefined;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top App Header */}
      <Header
        onNewAnalysis={() => {
          setCurrent(null);
          setError("");
        }}
        hasActiveResume={Boolean(current)}
      />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error notification banner if any */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <span className="font-bold block mb-0.5">Notice</span>
              <p>{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-rose-500 hover:text-rose-800 text-xs font-semibold px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading Overlay / Progress Modal */}
        {loading && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-7 max-w-sm w-full shadow-2xl text-center space-y-4 border border-slate-100">
              <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center relative">
                <span className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin absolute" />
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  AI Resume Analysis
                </h3>
                <p className="text-xs text-slate-600 mt-1 font-medium">
                  {loadingStep || "Analyzing resume..."}
                </p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-600 h-full w-2/3 animate-pulse rounded-full" />
              </div>
            </div>
          </div>
        )}

        {/* If NO Resume Selected -> Start directly with the Upload Section */}
        {!current ? (
          <div className="space-y-6">
            {/* Clean, Functional Section Header */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                AI Resume Checker
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Upload your resume (PDF or text) to check your ATS compatibility score, spot missing keywords, and get instant bullet point improvements.
              </p>
            </div>

            {/* Upload Section directly rendered as primary tool */}
            <UploadSection
              onFileUpload={handleFileUpload}
              onTextSubmit={handleTextSubmit}
              onLoadSample={handleLoadSample}
              isLoading={loading}
            />
          </div>
        ) : (
          /* Active Resume Analysis Dashboard */
          <div className="space-y-6">
            {/* Top Control Bar: Active Resume Info & Version Selector */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <h2 className="text-base font-bold text-slate-950 truncate">
                    {current.filename}
                  </h2>
                </div>
                {current.targetRole && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target Role: <span className="font-semibold text-slate-850">{current.targetRole}</span>
                  </p>
                )}
              </div>

              {/* Version History Selector Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-semibold mr-1">Versions:</span>
                {current.versions.map((ver, idx) => {
                  const isCurrent = idx === vIndex;
                  const score = ver.analysis.atsScore;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setVIndex(idx)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      <span>V{ver.versionNumber}</span>
                      <span className="opacity-75 font-mono text-[11px]">({score})</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrent(null)}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 ml-2"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  New Resume
                </button>
              </div>
            </div>

            {/* Tab navigation: Overview / Diff / Text */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "overview"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                <Layers className="w-4 h-4" />
                ATS Analysis & Rewrites
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("diff")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "diff"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                Version Comparison (Diff)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "text"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-200/60"
                }`}
              >
                <Code2 className="w-4 h-4" />
                Resume Text Editor
              </button>
            </div>

            {/* TAB 1: OVERVIEW & REWRITES */}
            {activeTab === "overview" && analysis && (
              <div className="space-y-6">
                {/* Executive Summary Alert Banner */}
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <span className="font-bold text-indigo-950 block mb-0.5">
                      Recruiter Evaluation Summary
                    </span>
                    <p className="text-indigo-900/90 leading-relaxed font-medium">
                      {analysis.summary}
                    </p>
                  </div>
                </div>

                {/* Score Gauge + Category Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <ScoreGauge
                    score={analysis.atsScore}
                    grade={analysis.grade}
                    previousScore={previousVersion?.analysis?.atsScore}
                  />
                  <div className="lg:col-span-2">
                    <ScoreBreakdown breakdown={analysis.breakdown} />
                  </div>
                </div>

                {/* Quick Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs text-center text-xs">
                  <div className="p-2 border-r border-slate-100 last:border-0">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                      Total Word Count
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-base">
                      {analysis.metrics?.wordCount || 0}
                    </span>
                  </div>
                  <div className="p-2 border-r border-slate-100 last:border-0">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                      Bullet Points
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-base">
                      {analysis.metrics?.bulletPointsCount || 0}
                    </span>
                  </div>
                  <div className="p-2 border-r border-slate-100 last:border-0">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                      Action Verbs Score
                    </span>
                    <span className="font-mono font-bold text-indigo-600 text-base">
                      {analysis.metrics?.actionVerbScore || 0}%
                    </span>
                  </div>
                  <div className="p-2">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">
                      Readability Grade
                    </span>
                    <span className="font-semibold text-slate-800 text-xs">
                      {analysis.metrics?.readabilityGrade || "Standard"}
                    </span>
                  </div>
                </div>

                {/* Core Rewrites Section */}
                <RewritesSection
                  rewrites={analysis.rewrites}
                  onApply={handleApplyRewrites}
                  isApplying={loading}
                  canApply={vIndex === current.versions.length - 1}
                  currentVersionNumber={currentVersion.versionNumber}
                />

                {/* Issues & Strengths */}
                <IssuesSection
                  issues={analysis.issues}
                  strengths={analysis.strengths}
                />

                {/* Keywords Analysis */}
                <KeywordsSection
                  keywords={analysis.keywords}
                  targetRoleMatch={analysis.targetRoleMatch}
                />
              </div>
            )}

            {/* TAB 2: VERSION DIFF VIEWER */}
            {activeTab === "diff" && (
              <VersionDiffViewer
                versions={current.versions}
                currentVersionIndex={vIndex}
              />
            )}

            {/* TAB 3: RESUME TEXT EDITOR */}
            {activeTab === "text" && currentVersion && (
              <ResumeTextEditor
                text={currentVersion.text}
                filename={current.filename}
                versionNumber={currentVersion.versionNumber}
                onSaveManualEdit={handleSaveManualEdit}
                isSaving={loading}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
