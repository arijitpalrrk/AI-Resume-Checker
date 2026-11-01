import React, { useState } from "react";
import { AtsIssue } from "../types.js";
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ShieldAlert } from "lucide-react";

interface IssuesSectionProps {
  issues: AtsIssue[];
  strengths: string[];
}

export const IssuesSection: React.FC<IssuesSectionProps> = ({ issues, strengths }) => {
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [activeTab, setActiveTab] = useState<"issues" | "strengths">("issues");

  const safeIssues = Array.isArray(issues) ? issues : [];
  const safeStrengths = Array.isArray(strengths) ? strengths : [];

  const filteredIssues = safeIssues.filter((i) => {
    if (filter === "all") return true;
    return i.severity === filter;
  });

  const getSeverityStyle = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return {
          badge: "bg-rose-100 text-rose-800 border-rose-200",
          icon: ShieldAlert,
          border: "border-l-rose-500",
          label: "Critical Blocker",
        };
      case "medium":
        return {
          badge: "bg-amber-100 text-amber-800 border-amber-200",
          icon: AlertTriangle,
          border: "border-l-amber-500",
          label: "Moderate Penalty",
        };
      case "low":
        return {
          badge: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Info,
          border: "border-l-blue-500",
          label: "Minor Optimization",
        };
    }
  };

  const highCount = safeIssues.filter((i) => i.severity === "high").length;
  const medCount = safeIssues.filter((i) => i.severity === "medium").length;
  const lowCount = safeIssues.filter((i) => i.severity === "low").length;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      {/* Tab toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("issues")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === "issues"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            ATS Issues & Fixes ({safeIssues.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("strengths")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === "strengths"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Candidate Strengths ({safeStrengths.length})
          </button>
        </div>

        {activeTab === "issues" && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-2 py-1 rounded text-[11px] font-medium ${
                filter === "all" ? "bg-slate-200 text-slate-800" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              All
            </button>
            {highCount > 0 && (
              <button
                type="button"
                onClick={() => setFilter("high")}
                className={`px-2 py-1 rounded text-[11px] font-medium ${
                  filter === "high" ? "bg-rose-100 text-rose-800" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                High ({highCount})
              </button>
            )}
            {medCount > 0 && (
              <button
                type="button"
                onClick={() => setFilter("medium")}
                className={`px-2 py-1 rounded text-[11px] font-medium ${
                  filter === "medium" ? "bg-amber-100 text-amber-800" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Medium ({medCount})
              </button>
            )}
            {lowCount > 0 && (
              <button
                type="button"
                onClick={() => setFilter("low")}
                className={`px-2 py-1 rounded text-[11px] font-medium ${
                  filter === "low" ? "bg-blue-100 text-blue-800" : "text-slate-500 hover:bg-slate-100"
                }`}
              >
                Low ({lowCount})
              </button>
            )}
          </div>
        )}
      </div>

      {activeTab === "issues" ? (
        <div className="space-y-3.5">
          {filteredIssues.map((issue) => {
            const style = getSeverityStyle(issue.severity);
            const Icon = style.icon;

            return (
              <div
                key={issue.id}
                className={`p-4 rounded-xl border border-slate-200/80 border-l-4 ${style.border} bg-white shadow-2xs hover:shadow-xs transition-shadow`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${style.badge}`}>
                      <Icon className="w-3 h-3" />
                      {style.label}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{issue.title}</h4>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 capitalize">
                    {issue.category.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-2 text-xs bg-slate-50 rounded-lg p-2.5 text-slate-700 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-0.5">Recommended Action:</span>
                  <p className="leading-relaxed">{issue.fix}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {strengths.map((str, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">{str}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
