import React, { useState } from "react";
import { Copy, Check, Download, Edit3, Printer, Save, RotateCcw } from "lucide-react";

interface ResumeTextEditorProps {
  text: string;
  filename: string;
  versionNumber: number;
  onSaveManualEdit: (newText: string) => Promise<void>;
  isSaving: boolean;
}

export const ResumeTextEditor: React.FC<ResumeTextEditorProps> = ({
  text,
  filename,
  versionNumber,
  onSaveManualEdit,
  isSaving,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [copied, setCopied] = useState(false);

  // Sync if text changes from outside
  React.useEffect(() => {
    setEditText(text);
  }, [text]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: "txt" | "md") => {
    const blob = new Blob([editText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const baseName = filename.replace(/\.[^/.]+$/, "");
    a.download = `${baseName}_V${versionNumber}_Optimized.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${filename} - V${versionNumber}</title>
          <style>
            body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; white-space: pre-wrap; font-size: 11pt; }
          </style>
        </head>
        <body>${editText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleSave = async () => {
    if (editText.trim() === text.trim()) {
      setIsEditing(false);
      return;
    }
    await onSaveManualEdit(editText);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Full Resume Text (Version {versionNumber})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Clean ATS-parsable plain text with all applied improvements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditText(text);
                  setIsEditing(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Re-evaluating ATS...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save & Re-score
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                Edit Text
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                {copied ? "Copied!" : "Copy Text"}
              </button>
              <button
                type="button"
                onClick={() => handleDownload("txt")}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Export TXT
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                Print
              </button>
            </>
          )}
        </div>
      </div>

      {/* Editor / Viewer Body */}
      {isEditing ? (
        <div>
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            rows={18}
            className="w-full p-4 rounded-xl border border-indigo-300 bg-white font-mono text-xs text-slate-900 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            placeholder="Edit resume text..."
          />
          <p className="text-[11px] text-slate-500 mt-2">
            Clicking "Save & Re-score" will trigger Gemini ATS analysis and append a new version to history.
          </p>
        </div>
      ) : (
        <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
          {editText}
        </pre>
      )}
    </div>
  );
};
