import React, { useState } from "react";
import { BulletRewrite } from "../types.js";
import { Sparkles, Check, ArrowRight, Edit3, RotateCcw, CheckSquare, Square } from "lucide-react";
import confetti from "canvas-confetti";

interface RewritesSectionProps {
  rewrites: BulletRewrite[];
  onApply: (selectedIds: string[], customEdits: Record<string, string>) => Promise<void>;
  isApplying: boolean;
  canApply: boolean;
  currentVersionNumber: number;
}

export const RewritesSection: React.FC<RewritesSectionProps> = ({
  rewrites,
  onApply,
  isApplying,
  canApply,
  currentVersionNumber,
}) => {
  const safeRewrites = Array.isArray(rewrites) ? rewrites : [];
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    safeRewrites.map((r) => r.id)
  );
  const [customEdits, setCustomEdits] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  // Sync selected IDs when rewrites list updates
  React.useEffect(() => {
    setSelectedIds(safeRewrites.map((r) => r.id));
    setCustomEdits({});
    setEditingId(null);
  }, [rewrites]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === safeRewrites.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(safeRewrites.map((r) => r.id));
    }
  };

  const handleCustomChange = (id: string, text: string) => {
    setCustomEdits((prev) => ({ ...prev, [id]: text }));
  };

  const resetCustom = (id: string) => {
    setCustomEdits((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setEditingId(null);
  };

  const handleApplyClick = async () => {
    if (selectedIds.length === 0) return;
    try {
      await onApply(selectedIds, customEdits);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // Error handled by parent
    }
  };

  if (safeRewrites.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs text-center text-slate-500 py-10">
        No bullet rewrites suggested for this version.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              AI Impact & Metric Bullet Rewrites
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Transformed into Google XYZ formula ("Accomplished [X] measured by [Y] by doing [Z]"). Select which ones to apply.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={toggleAll}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
          >
            {selectedIds.length === safeRewrites.length ? (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                Deselect All
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5 text-slate-400" />
                Select All ({safeRewrites.length})
              </>
            )}
          </button>

          {canApply && (
            <button
              type="button"
              disabled={isApplying || selectedIds.length === 0}
              onClick={handleApplyClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-xs"
            >
              {isApplying ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Generating V{currentVersionNumber + 1}...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Apply Selected ({selectedIds.length}) → V{currentVersionNumber + 1}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Rewrites list */}
      <div className="mt-5 space-y-4">
        {safeRewrites.map((rw, index) => {
          const isSelected = selectedIds.includes(rw.id);
          const isCustomized = Boolean(customEdits[rw.id]);
          const currentImproved = customEdits[rw.id] ?? rw.improved;
          const isEditingThis = editingId === rw.id;

          return (
            <div
              key={rw.id || index}
              className={`group relative rounded-xl border transition-all duration-200 p-4 ${
                isSelected
                  ? "border-indigo-200 bg-indigo-50/20 shadow-xs"
                  : "border-slate-200/70 bg-slate-50/40 opacity-75"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Selection checkbox */}
                <button
                  type="button"
                  onClick={() => toggleSelect(rw.id)}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                      : "border-slate-300 bg-white hover:border-slate-400"
                  }`}
                  aria-label="Select rewrite"
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="flex-1 space-y-2.5">
                  {/* Category & badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Bullet #{index + 1}
                      </span>
                      {rw.category && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                          {rw.category}
                        </span>
                      )}
                      {rw.impactMetricAdded && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                          + Metric Injected
                        </span>
                      )}
                      {isCustomized && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/60">
                          Customized by You
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isCustomized && (
                        <button
                          type="button"
                          onClick={() => resetCustom(rw.id)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100"
                          title="Reset to AI suggestion"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reset
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingId(isEditingThis ? null : rw.id)}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 px-2 py-0.5 rounded hover:bg-indigo-50"
                      >
                        <Edit3 className="w-3 h-3" />
                        {isEditingThis ? "Done Editing" : "Edit Text"}
                      </button>
                    </div>
                  </div>

                  {/* Original text */}
                  <div className="rounded-lg bg-rose-50/60 border border-rose-200/50 p-2.5 text-xs text-rose-900/80 font-mono">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-rose-500 block mb-0.5">
                      Original (Weak ATS Signal)
                    </span>
                    <span className="line-through decoration-rose-400">{rw.original}</span>
                  </div>

                  {/* Improved text */}
                  <div className="rounded-lg bg-emerald-50/70 border border-emerald-200/60 p-2.5 text-xs text-emerald-950 font-mono">
                    <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-emerald-600" />
                      ATS-Optimized Version (Google XYZ Formula)
                    </span>

                    {isEditingThis ? (
                      <textarea
                        value={currentImproved}
                        onChange={(e) => handleCustomChange(rw.id, e.target.value)}
                        rows={2}
                        className="w-full mt-1 p-2 bg-white rounded border border-emerald-300 text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        placeholder="Tune your improved bullet..."
                      />
                    ) : (
                      <span className="leading-relaxed font-medium">{currentImproved}</span>
                    )}
                  </div>

                  {/* Recruiter Rationale */}
                  <p className="text-[11px] text-slate-500 flex items-start gap-1">
                    <span className="font-semibold text-slate-700 flex-shrink-0">ATS Logic:</span>
                    <span>{rw.reason}</span>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Bar if multiple rewrites */}
      {canApply && safeRewrites.length > 2 && (
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {selectedIds.length} of {safeRewrites.length} rewrites selected
          </span>
          <button
            type="button"
            disabled={isApplying || selectedIds.length === 0}
            onClick={handleApplyClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-md"
          >
            {isApplying ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Evaluating new ATS score...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Apply Selected Rewrites ({selectedIds.length}) → Create Version {currentVersionNumber + 1}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
