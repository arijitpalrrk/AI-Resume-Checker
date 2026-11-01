import React from "react";
import { TrendingUp, Award, AlertCircle } from "lucide-react";

interface ScoreGaugeProps {
  score: number;
  grade: string;
  previousScore?: number;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  grade,
  previousScore,
  size = 200,
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let colorClass = "text-rose-500";
  let bgGradient = "from-rose-500/10 to-rose-500/5";
  let badgeColor = "bg-rose-100 text-rose-800 border-rose-200";

  if (clampedScore >= 90) {
    colorClass = "text-emerald-500";
    bgGradient = "from-emerald-500/10 to-emerald-500/5";
    badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
  } else if (clampedScore >= 75) {
    colorClass = "text-blue-500";
    bgGradient = "from-blue-500/10 to-blue-500/5";
    badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
  } else if (clampedScore >= 60) {
    colorClass = "text-amber-500";
    bgGradient = "from-amber-500/10 to-amber-500/5";
    badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
  }

  const delta = previousScore !== undefined ? clampedScore - previousScore : 0;

  return (
    <div className={`relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b ${bgGradient} border border-slate-200/80 shadow-xs`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-200/70"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${colorClass} transition-all duration-1000 ease-out`}
            fill="transparent"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-extrabold tracking-tight text-slate-900 font-mono">
            {clampedScore}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">
            ATS Score
          </span>
          <span className="text-[10px] text-slate-400">/ 100</span>
        </div>
      </div>

      {/* Grade and delta */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
          {clampedScore >= 75 ? <Award className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {grade}
        </span>

        {delta !== 0 && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              delta > 0 ? "text-emerald-700 font-medium" : "text-slate-500"
            }`}
          >
            {delta > 0 && <TrendingUp className="w-3.5 h-3.5" />}
            {delta > 0 ? `+${delta} pts improvement` : `${delta} pts vs previous`}
          </span>
        )}
      </div>

      <div className="mt-3 text-center">
        <p className="text-[11px] text-slate-500 max-w-[220px]">
          {clampedScore >= 75
            ? "High pass probability across Workday, Greenhouse & Taleo ATS screening."
            : "Below optimal recruiter threshold (75+). Apply recommended rewrites below."}
        </p>
      </div>
    </div>
  );
};
