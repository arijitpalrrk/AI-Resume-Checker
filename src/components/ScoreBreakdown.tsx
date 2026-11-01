import React from "react";
import { AtsBreakdown } from "../types.js";
import { CheckCircle2, AlertTriangle, Zap, FileText, Search } from "lucide-react";

interface ScoreBreakdownProps {
  breakdown: AtsBreakdown;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ breakdown }) => {
  const items = [
    {
      key: "keywords",
      label: "Keyword Density & Skills Match",
      value: Number(breakdown?.keywords) || 75,
      icon: Search,
      desc: "Presence of essential technical and industry-standard keywords required by parsers.",
    },
    {
      key: "impact",
      label: "Measurable Impact (Google XYZ)",
      value: Number(breakdown?.impact) || 60,
      icon: Zap,
      desc: "Use of quantifiable outcomes: percentages, revenue, time saved, and scale metrics.",
    },
    {
      key: "formatting",
      label: "ATS Formatting & Structure",
      value: Number(breakdown?.formatting) || 80,
      icon: FileText,
      desc: "Standard headers, clean layout, reverse-chronological order, and parsability.",
    },
    {
      key: "actionVerbs",
      label: "Power Verbs & Tone",
      value: Number(breakdown?.actionVerbs) || 65,
      icon: CheckCircle2,
      desc: "Authoritative opening verbs ('Architected', 'Spearheaded') avoiding passive voice.",
    },
    {
      key: "clarity",
      label: "Clarity & Conciseness",
      value: Number(breakdown?.clarity) || 70,
      icon: AlertTriangle,
      desc: "Brevity, absence of filler fluff, optimal length, and readable sentence flow.",
    },
  ];

  const getColor = (val: number) => {
    if (val >= 85) return { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50" };
    if (val >= 70) return { bar: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50" };
    if (val >= 55) return { bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50" };
    return { bar: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50" };
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            ATS Core Category Breakdown
          </h3>
          <span className="text-xs font-medium text-slate-500">Benchmark: 75%+</span>
        </div>

        <div className="space-y-4">
          {items.map((item) => {
            const colors = getColor(item.value);
            const Icon = item.icon;
            return (
              <div key={item.key} className="group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition-colors" />
                    <span className="font-semibold text-slate-800">{item.label}</span>
                  </div>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                    {item.value}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors.bar} transition-all duration-700 ease-out`}
                    style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 group-hover:line-clamp-none transition-all">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Evaluated by Gemini 3.8 Flash ATS Engine</span>
        <span className="font-medium text-slate-700">Strict Scoring Model</span>
      </div>
    </div>
  );
};
