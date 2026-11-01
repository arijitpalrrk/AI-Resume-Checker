export interface AtsBreakdown {
  keywords: number;
  formatting: number;
  impact: number;
  clarity: number;
  actionVerbs: number;
}

export interface AtsIssue {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  category: 'keywords' | 'formatting' | 'quantifiable_impact' | 'structure' | 'tone';
  fix: string;
}

export interface BulletRewrite {
  id: string;
  original: string;
  improved: string;
  reason: string;
  category?: string;
  impactMetricAdded?: boolean;
}

export interface KeywordsAnalysis {
  present: string[];
  missing: string[];
}

export interface ResumeMetrics {
  wordCount: number;
  bulletPointsCount: number;
  actionVerbScore: number;
  readabilityGrade: string;
}

export interface TargetRoleMatch {
  roleTitle: string;
  matchScore: number;
  keyMissingRequirements: string[];
  recommendations: string[];
}

export interface ResumeAnalysis {
  atsScore: number;
  grade: 'Needs Urgent Work' | 'Fair Match' | 'Competitive' | 'Top Tier';
  summary: string;
  breakdown: AtsBreakdown;
  issues: AtsIssue[];
  strengths: string[];
  rewrites: BulletRewrite[];
  keywords: KeywordsAnalysis;
  metrics: ResumeMetrics;
  targetRoleMatch?: TargetRoleMatch;
}

export interface ResumeVersion {
  versionNumber: number;
  text: string;
  source: 'upload' | 'rewrite' | 'edit' | 'sample';
  targetRole?: string;
  targetJobDescription?: string;
  analysis: ResumeAnalysis;
  createdAt: string;
}

export interface ResumeRecord {
  id: string;
  filename: string;
  targetRole?: string;
  targetJobDescription?: string;
  versions: ResumeVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface ResumeSummary {
  id: string;
  filename: string;
  targetRole?: string;
  versionCount: number;
  latestScore: number;
  initialScore: number;
  createdAt: string;
  updatedAt: string;
}
