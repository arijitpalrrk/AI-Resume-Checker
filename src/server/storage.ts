import fs from "fs";
import path from "path";
import { ResumeRecord, ResumeSummary, ResumeAnalysis, ResumeVersion } from "../types.js";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "resumes.json");

let memoryCache: Map<string, ResumeRecord> = new Map();
let isInitialized = false;

function ensureDirectoryExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function saveToDisk() {
  try {
    ensureDirectoryExists(DATA_FILE);
    const data = Array.from(memoryCache.values());
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not save to disk, using memory storage:", err);
  }
}

function loadFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      const list = JSON.parse(content) as ResumeRecord[];
      memoryCache = new Map(list.map((r) => [r.id, r]));
    }
  } catch (err) {
    console.warn("Could not read resumes.json from disk, re-initializing:", err);
  }
}

function seedSampleResumes() {
  if (memoryCache.size > 0) return;

  const sample1Id = "sample-fullstack-dev";
  const sample1Text = `ALEX MORGAN
San Francisco, CA | alex.morgan@email.com | (555) 345-6789 | linkedin.com/in/alexmorgan | github.com/alexm

PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years of building web applications. Skilled in React, Node.js, and cloud systems. Passionate about solving complex problems and collaborating with team members.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, HTML5, CSS3, SQL
Frameworks & Libraries: React, Node.js, Express, Next.js, Redux, Tailwind CSS
Tools & Cloud: AWS (S3, EC2), Docker, Git, PostgreSQL, MongoDB, Jest

PROFESSIONAL EXPERIENCE
Senior Full Stack Developer | NexaTech Solutions | 2022 - Present
• Responsible for developing web applications and fixing bugs in production.
• Worked with cross-functional teams to release software features on schedule.
• Helped improve database queries and system speed.
• Managed daily deployments and monitored cloud servers on AWS.
• Mentored junior developers on best coding standards and code reviews.

Software Engineer | PulseWave Technologies | 2020 - 2022
• Built reusable frontend components using React and styled-components.
• Assisted in migrating legacy monolithic backend to modern microservices.
• Integrated third-party payment APIs including Stripe and PayPal.
• Participated in daily Agile sprint meetings and feature planning sessions.

EDUCATION
Bachelor of Science in Computer Science | University of California, Davis | 2016 - 2020`;

  const sample1Analysis: ResumeAnalysis = {
    atsScore: 68,
    grade: "Fair Match",
    summary: "Solid foundational background and clear tech stack, but the experience section suffers from passive language ('Responsible for', 'Helped improve') and completely lacks measurable business impact metrics.",
    breakdown: {
      keywords: 78,
      formatting: 82,
      impact: 48,
      clarity: 72,
      actionVerbs: 60,
    },
    issues: [
      {
        id: "iss-1",
        title: "Zero Quantifiable Metrics in Senior Role",
        severity: "high",
        category: "quantifiable_impact",
        fix: "Incorporate numbers (latency % reduced, user counts, uptime %, revenue impact) into your NexaTech bullet points.",
      },
      {
        id: "iss-2",
        title: "Weak Opening Action Verbs",
        severity: "high",
        category: "formatting",
        fix: "Replace 'Responsible for developing' and 'Assisted in migrating' with authoritative verbs like 'Architected', 'Spearheaded', and 'Engineered'.",
      },
      {
        id: "iss-3",
        title: "Missing Modern DevOps & Cloud ATS Keywords",
        severity: "medium",
        category: "keywords",
        fix: "Target companies looking for Kubernetes, CI/CD pipelines (GitHub Actions), Redis caching, and Microservices observability.",
      },
      {
        id: "iss-4",
        title: "Vague Professional Summary",
        severity: "low",
        category: "tone",
        fix: "Transform the summary to highlight specific domains (FinTech, SaaS) and proven engineering scale.",
      },
    ],
    strengths: [
      "Well-formatted single-column layout easily parsed by Workday and Greenhouse",
      "Explicit technical skills block with clear categorization",
      "Consistent reverse-chronological work experience",
      "Strong educational background in Computer Science",
    ],
    rewrites: [
      {
        id: "rw-1",
        original: "Responsible for developing web applications and fixing bugs in production.",
        improved: "Architected and shipped 4 high-concurrency React & TypeScript web applications, boosting user engagement by 32% across 85,000 monthly active users.",
        reason: "Replaces passive task description with concrete metrics (32% engagement, 85k users) and modern tech attribution.",
        category: "Architecture & Scale",
        impactMetricAdded: true,
      },
      {
        id: "rw-2",
        original: "Worked with cross-functional teams to release software features on schedule.",
        improved: "Spearheaded bi-weekly agile release cadences across 8 engineers and UX designers, achieving a 99.4% on-time sprint completion rate.",
        reason: "Adds team scope and quantifiable delivery reliability percentage.",
        category: "Leadership",
        impactMetricAdded: true,
      },
      {
        id: "rw-3",
        original: "Helped improve database queries and system speed.",
        improved: "Optimized PostgreSQL indexes and implemented Redis caching, slashing P95 API response times by 64% from 420ms to 150ms.",
        reason: "Transforms vague 'helped improve' into definitive database optimization engineering wins.",
        category: "Performance",
        impactMetricAdded: true,
      },
      {
        id: "rw-4",
        original: "Managed daily deployments and monitored cloud servers on AWS.",
        improved: "Automated multi-stage CI/CD deployments via GitHub Actions and AWS ECS, trimming release cycle durations by 45 minutes.",
        reason: "Specifies tooling and exact time savings achieved through automation.",
        category: "DevOps",
        impactMetricAdded: true,
      },
      {
        id: "rw-5",
        original: "Assisted in migrating legacy monolithic backend to modern microservices.",
        improved: "Engineered 3 core decoupled Go/Node.js microservices during monolith decommissioning, reducing single-point-of-failure incidents to zero.",
        reason: "Quantifies engineering contribution and system reliability impact.",
        category: "System Design",
        impactMetricAdded: true,
      },
    ],
    keywords: {
      present: ["React", "TypeScript", "Node.js", "Express", "AWS", "Docker", "SQL", "Git", "PostgreSQL", "MongoDB"],
      missing: ["CI/CD Pipelines", "Kubernetes", "Redis", "System Architecture", "Performance Optimization", "GraphQL", "Test-Driven Development (TDD)"],
    },
    metrics: {
      wordCount: 280,
      bulletPointsCount: 9,
      actionVerbScore: 60,
      readabilityGrade: "Grade 10 - Clear & Parsable",
    },
    targetRoleMatch: {
      roleTitle: "Senior Full Stack Engineer",
      matchScore: 72,
      keyMissingRequirements: ["CI/CD pipelines", "Kubernetes", "System scalability metrics"],
      recommendations: [
        "Include production volume metrics (requests/sec, database scale)",
        "Highlight test automation coverage and code review leadership",
      ],
    },
  };

  const sample1: ResumeRecord = {
    id: sample1Id,
    filename: "Alex_Morgan_Senior_Software_Engineer.pdf",
    targetRole: "Senior Full Stack Engineer",
    targetJobDescription: "Seeking a Senior Full Stack Engineer experienced with TypeScript, React, scalable cloud infrastructure, and CI/CD pipelines.",
    versions: [
      {
        versionNumber: 1,
        text: sample1Text,
        source: "upload",
        targetRole: "Senior Full Stack Engineer",
        analysis: sample1Analysis,
        createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  };

  memoryCache.set(sample1Id, sample1);
  saveToDisk();
}

export function initStorage() {
  if (isInitialized) return;
  loadFromDisk();
  seedSampleResumes();
  isInitialized = true;
}

export function getResumes(): ResumeSummary[] {
  initStorage();
  return Array.from(memoryCache.values())
    .map((r) => {
      const v = r.versions;
      const latest = v[v.length - 1];
      const initial = v[0];
      return {
        id: r.id,
        filename: r.filename,
        targetRole: r.targetRole,
        versionCount: v.length,
        latestScore: latest?.analysis?.atsScore || 0,
        initialScore: initial?.analysis?.atsScore || 0,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getResume(id: string): ResumeRecord | undefined {
  initStorage();
  return memoryCache.get(id);
}

export function createResume(
  filename: string,
  text: string,
  analysis: ResumeAnalysis,
  targetRole?: string,
  targetJobDescription?: string
): ResumeRecord {
  initStorage();
  const id = `res_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date().toISOString();

  const record: ResumeRecord = {
    id,
    filename,
    targetRole,
    targetJobDescription,
    versions: [
      {
        versionNumber: 1,
        text,
        source: "upload",
        targetRole,
        targetJobDescription,
        analysis,
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  memoryCache.set(id, record);
  saveToDisk();
  return record;
}

export function addVersion(
  id: string,
  text: string,
  analysis: ResumeAnalysis,
  source: "rewrite" | "edit"
): ResumeRecord | null {
  initStorage();
  const record = memoryCache.get(id);
  if (!record) return null;

  const latest = record.versions[record.versions.length - 1];
  const newVersion: ResumeVersion = {
    versionNumber: (latest?.versionNumber || 0) + 1,
    text,
    source,
    targetRole: record.targetRole,
    targetJobDescription: record.targetJobDescription,
    analysis,
    createdAt: new Date().toISOString(),
  };

  record.versions.push(newVersion);
  record.updatedAt = new Date().toISOString();

  memoryCache.set(id, record);
  saveToDisk();
  return record;
}

export function deleteResume(id: string): boolean {
  initStorage();
  const deleted = memoryCache.delete(id);
  if (deleted) saveToDisk();
  return deleted;
}
