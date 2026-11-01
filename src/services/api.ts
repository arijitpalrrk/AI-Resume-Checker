import { ResumeRecord, ResumeSummary } from "../types.js";

export async function getResumes(): Promise<ResumeSummary[]> {
  const res = await fetch("/api/resumes");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load resume history");
  }
  return res.json();
}

export async function getResume(id: string): Promise<ResumeRecord> {
  const res = await fetch(`/api/resumes/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load resume details");
  }
  return res.json();
}

export async function uploadResumeFile(
  file: File,
  targetRole?: string,
  targetJobDescription?: string
): Promise<ResumeRecord> {
  const fd = new FormData();
  fd.append("resume", file);
  if (targetRole) fd.append("targetRole", targetRole);
  if (targetJobDescription) fd.append("targetJobDescription", targetJobDescription);

  const res = await fetch("/api/resumes", {
    method: "POST",
    body: fd,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to upload and analyze resume");
  }
  return res.json();
}

export async function analyzeResumeText(
  text: string,
  filename: string = "Pasted_Resume.txt",
  targetRole?: string,
  targetJobDescription?: string
): Promise<ResumeRecord> {
  const res = await fetch("/api/resumes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, filename, targetRole, targetJobDescription }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to analyze resume text");
  }
  return res.json();
}

export async function applyRewrites(
  id: string,
  selectedRewriteIds: string[],
  customEdits?: Record<string, string>
): Promise<ResumeRecord> {
  const res = await fetch(`/api/resumes/${encodeURIComponent(id)}/apply-rewrites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ selectedRewriteIds, customEdits }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to apply rewrites");
  }
  return res.json();
}

export async function manualEditResume(id: string, newText: string): Promise<ResumeRecord> {
  const res = await fetch(`/api/resumes/${encodeURIComponent(id)}/manual-edit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newText }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update resume text");
  }
  return res.json();
}

export async function deleteResume(id: string): Promise<void> {
  const res = await fetch(`/api/resumes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete resume");
  }
}

export async function loadSampleResume(sampleType: string): Promise<ResumeRecord> {
  const res = await fetch(`/api/resumes/sample/${encodeURIComponent(sampleType)}`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load sample resume");
  }
  return res.json();
}
