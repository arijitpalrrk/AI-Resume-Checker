import React, { useState } from "react";
import { KeywordsAnalysis, TargetRoleMatch } from "../types.js";
import { Tag, Check, Plus, Copy, Briefcase } from "lucide-react";

interface KeywordsSectionProps {
  keywords?: KeywordsAnalysis;
  targetRoleMatch?: TargetRoleMatch;
}

export const KeywordsSection: React.FC<KeywordsSectionProps> = ({
  keywords,
  targetRoleMatch,
}) => {
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  const copyKeyword = (word: string) => {
    navigator.clipboard.writeText(word);
    setCopiedKeyword(word);
    setTimeout(() => setCopiedKeyword(null), 1500);
  };

  const presentList = Array.isArray(keywords?.present) ? keywords.present : [];
  const missingList = Array.isArray(keywords?.missing) ? keywords.missing : [];
  const missingRequirements = Array.isArray(targetRoleMatch?.keyMissingRequirements)
    ? targetRoleMatch.keyMissingRequirements
    : [];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
      {/* Target Role Matching Banner if present */}
      {targetRoleMatch && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 truncate">
                Target Role: {targetRoleMatch.roleTitle || "Target Role Match"}
              </span>
            </div>
            {typeof targetRoleMatch.matchScore === "number" && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-600 text-white shadow-2xs font-mono self-start sm:self-auto">
                {targetRoleMatch.matchScore}% Match
              </span>
            )}
          </div>

          {missingRequirements.length > 0 && (
            <div className="mt-2 text-xs text-indigo-950">
              <span className="font-semibold">Key missing prerequisites: </span>
              {missingRequirements.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Present Keywords */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Detected ATS Keywords ({presentList.length})
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">Recognized by ATS parsers</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {presentList.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => copyKeyword(word)}
              title="Click to copy keyword"
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70 hover:bg-emerald-100 transition-colors"
            >
              <Check className="w-3 h-3 text-emerald-600" />
              <span>{word}</span>
              {copiedKeyword === word && (
                <span className="text-[10px] font-bold text-emerald-700">Copied!</span>
              )}
            </button>
          ))}
          {presentList.length === 0 && (
            <p className="text-xs text-slate-400">No industry keywords successfully identified.</p>
          )}
        </div>
      </div>

      {/* Missing Keywords */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-rose-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Missing High-Value Keywords ({missingList.length})
            </h4>
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Add these to skills/bullets</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {missingList.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => copyKeyword(word)}
              title="Click to copy missing keyword"
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200/70 hover:bg-rose-100 transition-colors"
            >
              <Plus className="w-3 h-3 text-rose-500" />
              <span>{word}</span>
              <Copy className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              {copiedKeyword === word && (
                <span className="text-[10px] font-bold text-rose-700">Copied!</span>
              )}
            </button>
          ))}
          {missingList.length === 0 && (
            <p className="text-xs text-emerald-600">Great coverage! No critical missing keywords detected.</p>
          )}
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          Tip: Click any missing keyword to copy it, then weave it naturally into your skills list or project accomplishments.
        </p>
      </div>
    </div>
  );
};
