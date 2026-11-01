import React, { useState } from "react";
import { ResumeVersion } from "../types.js";
import { ArrowLeftRight, TrendingUp } from "lucide-react";

interface VersionDiffViewerProps {
  versions: ResumeVersion[];
  currentVersionIndex: number;
}

export const VersionDiffViewer: React.FC<VersionDiffViewerProps> = ({
  versions,
  currentVersionIndex,
}) => {
  const [baseVersionIndex, setBaseVersionIndex] = useState<number>(0);
  const targetVersionIndex = currentVersionIndex;

  const baseVersion = versions[baseVersionIndex] || versions[0];
  const targetVersion = versions[targetVersionIndex] || versions[versions.length - 1];

  const baseLines = (baseVersion?.text || "").split("\n");
  const targetLines = (targetVersion?.text || "").split("\n");

  const scoreDiff = (targetVersion?.analysis?.atsScore || 0) - (baseVersion?.analysis?.atsScore || 0);

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      {/* Header and selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Side-by-Side Version Evolution
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare text and ATS performance progression across your optimization iterations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Compare:</span>
            <select
              value={baseVersionIndex}
              onChange={(e) => setBaseVersionIndex(Number(e.target.value))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              {versions.map((v, i) => (
                <option key={i} value={i}>
                  V{v.versionNumber} (Score: {v.analysis.atsScore})
                </option>
              ))}
            </select>
            <span className="text-slate-400">vs</span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              V{targetVersion.versionNumber} (Score: {targetVersion.analysis.atsScore})
            </span>
          </div>

          {scoreDiff !== 0 && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                scoreDiff > 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {scoreDiff > 0 ? `+${scoreDiff} pts` : `${scoreDiff} pts`}
            </span>
          )}
        </div>
      </div>

      {/* Side-by-side view */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Base Version Panel */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">Version {baseVersion.versionNumber}</span>
              <span className="text-slate-500">({baseVersion.source})</span>
            </div>
            <span className="font-mono font-bold text-slate-700">
              Score: {baseVersion.analysis.atsScore}
            </span>
          </div>
          <div className="space-y-1 font-mono text-[11px] leading-relaxed max-h-[480px] overflow-y-auto pr-1">
            {baseLines.map((line, idx) => {
              const isDifferent = !targetLines.includes(line) && line.trim().length > 0;
              return (
                <div
                  key={idx}
                  className={`p-1 rounded ${
                    isDifferent
                      ? "bg-rose-100/70 text-rose-950 font-medium border-l-2 border-rose-500"
                      : "text-slate-700"
                  }`}
                >
                  {line || "\u00A0"}
                </div>
              );
            })}
          </div>
        </div>

        {/* Target Version Panel */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/20 p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-indigo-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-900">Version {targetVersion.versionNumber}</span>
              <span className="text-indigo-600">({targetVersion.source})</span>
            </div>
            <span className="font-mono font-extrabold text-indigo-700">
              Score: {targetVersion.analysis.atsScore}
            </span>
          </div>
          <div className="space-y-1 font-mono text-[11px] leading-relaxed max-h-[480px] overflow-y-auto pr-1">
            {targetLines.map((line, idx) => {
              const isNewOrImproved = !baseLines.includes(line) && line.trim().length > 0;
              return (
                <div
                  key={idx}
                  className={`p-1 rounded ${
                    isNewOrImproved
                      ? "bg-emerald-100/80 text-emerald-950 font-medium border-l-2 border-emerald-500"
                      : "text-slate-700"
                  }`}
                >
                  {line || "\u00A0"}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
