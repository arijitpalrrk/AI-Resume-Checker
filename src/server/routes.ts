import { Router } from "express";
import multer from "multer";
import {
  getResumes,
  getResume,
  createResume,
  addVersion,
  deleteResume,
} from "./storage.js";
import { analyzeResumeWithGemini } from "./gemini.js";

const router = Router();

// 5MB limit for uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/octet-stream",
    ];
    if (
      allowed.includes(file.mimetype) ||
      file.originalname.endsWith(".pdf") ||
      file.originalname.endsWith(".txt") ||
      file.originalname.endsWith(".md")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Please upload a PDF or plain text file (.pdf, .txt, .md)."));
    }
  },
});

// Resilient PDF text extraction
async function extractTextFromBuffer(buffer: Buffer, filename: string): Promise<string> {
  // Check if plain text
  if (filename.endsWith(".txt") || filename.endsWith(".md")) {
    const text = buffer.toString("utf-8");
    if (text.trim().length > 20) return text;
  }

  // Verify PDF header magic bytes "%PDF"
  const isPdfHeader = buffer.length > 4 && buffer.slice(0, 4).toString() === "%PDF";

  try {
    const pdfParseModule = await import("pdf-parse");
    const PDFParse = (pdfParseModule as any).PDFParse || (pdfParseModule as any).default;
    if (typeof PDFParse === "function") {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      const extracted = typeof result === "string" ? result : result?.text || "";
      if (extracted && extracted.trim().length > 30) {
        return extracted;
      }
    }
  } catch (err) {
    console.warn("Primary PDF parser threw error, trying stream fallback:", err);
  }

  // Fallback: extract ASCII / UTF-8 strings
  const raw = buffer.toString("latin1");
  const textChunks: string[] = [];
  const matches = raw.matchAll(/\(([^)]{2,})\)\s*Tj/g);
  for (const match of matches) {
    if (match[1]) textChunks.push(match[1]);
  }

  if (textChunks.length > 5) {
    const joined = textChunks.join(" ").replace(/\\(\d{3})/g, " ").trim();
    if (joined.length > 50) return joined;
  }

  if (isPdfHeader) {
    // If it's a PDF but text couldn't be extracted, it might be an image/scanned PDF
    throw new Error(
      "Could not extract readable text from this PDF. It appears to be a scanned document or image-only PDF. Please try a text-based PDF or paste your resume text directly."
    );
  }

  // Otherwise try utf8 decode
  const fallback = buffer.toString("utf-8").trim();
  if (fallback.length > 40) return fallback;

  throw new Error("Unable to parse resume content. Please paste your resume text directly into the text tab.");
}

// Helper for safe non-regex string replacement
function safeReplaceOnce(source: string, search: string, replacement: string): string {
  if (!search || !source) return source;
  const index = source.indexOf(search);
  if (index === -1) {
    // Try normalized whitespace match
    const normSource = source.replace(/\s+/g, " ");
    const normSearch = search.replace(/\s+/g, " ");
    const normIndex = normSource.indexOf(normSearch);
    if (normIndex !== -1) {
      // Find approximate position in original
      return source.replace(search.trim(), replacement);
    }
    return source;
  }
  return source.substring(0, index) + replacement + source.substring(index + search.length);
}

// 1. List all resumes
router.get("/", (_req, res) => {
  try {
    const list = getResumes();
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to retrieve resumes." });
  }
});

// 2. Get single resume by ID
router.get("/:id", (req, res) => {
  try {
    const resume = getResume(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }
    res.json(resume);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to retrieve resume." });
  }
});

// 3. Upload or paste resume
router.post("/", (req, res) => {
  upload.single("resume")(req, res, async (uploadErr) => {
    try {
      if (uploadErr) {
        return res.status(400).json({ message: uploadErr.message });
      }

      let text = "";
      let filename = "My_Resume.txt";
      let targetRole = "";
      let targetJobDescription = "";

      if (req.file) {
        filename = req.file.originalname;
        targetRole = (req.body.targetRole || "").trim();
        targetJobDescription = (req.body.targetJobDescription || "").trim();
        text = await extractTextFromBuffer(req.file.buffer, filename);
      } else if (req.body && typeof req.body.text === "string") {
        text = req.body.text.trim();
        filename = (req.body.filename || "Pasted_Resume.txt").trim();
        targetRole = (req.body.targetRole || "").trim();
        targetJobDescription = (req.body.targetJobDescription || "").trim();
      } else {
        return res.status(400).json({
          message: "Please upload a PDF file or provide resume text in the request body.",
        });
      }

      if (!text || text.length < 50) {
        return res.status(400).json({
          message: "The provided resume text is too brief (minimum 50 characters required for ATS evaluation).",
        });
      }

      // Analyze with Gemini ATS reviewer
      const analysis = await analyzeResumeWithGemini(text, targetRole, targetJobDescription);

      const record = createResume(filename, text, analysis, targetRole, targetJobDescription);
      res.status(201).json(record);
    } catch (err: any) {
      console.error("Resume analysis error:", err);
      res.status(500).json({ message: err.message || "Failed to analyze resume." });
    }
  });
});

// 4. Apply selected rewrites -> creates a new version
router.post("/:id/apply-rewrites", async (req, res) => {
  try {
    const resume = getResume(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    const latest = resume.versions[resume.versions.length - 1];
    const { selectedRewriteIds, customEdits } = req.body || {};

    const availableRewrites = latest.analysis.rewrites || [];
    let targeted = availableRewrites;

    if (Array.isArray(selectedRewriteIds) && selectedRewriteIds.length > 0) {
      targeted = availableRewrites.filter((r) => selectedRewriteIds.includes(r.id));
    }

    if (targeted.length === 0) {
      return res.status(400).json({ message: "No rewrites selected to apply." });
    }

    let updatedText = latest.text;
    let appliedCount = 0;

    for (const rw of targeted) {
      // Allow custom edited text if the user customized it before applying
      const replacement = (customEdits && customEdits[rw.id]) ? customEdits[rw.id] : rw.improved;
      const original = rw.original;

      const nextText = safeReplaceOnce(updatedText, original, replacement);
      if (nextText !== updatedText) {
        updatedText = nextText;
        appliedCount++;
      } else {
        // Try trimming
        const trimmedOriginal = original.trim();
        const nextTrimmed = safeReplaceOnce(updatedText, trimmedOriginal, replacement);
        if (nextTrimmed !== updatedText) {
          updatedText = nextTrimmed;
          appliedCount++;
        }
      }
    }

    // Re-evaluate updated text with Gemini ATS engine
    const analysis = await analyzeResumeWithGemini(
      updatedText,
      resume.targetRole,
      resume.targetJobDescription
    );

    const updatedRecord = addVersion(resume.id, updatedText, analysis, "rewrite");
    res.json(updatedRecord);
  } catch (err: any) {
    console.error("Apply rewrites error:", err);
    res.status(500).json({ message: err.message || "Failed to apply rewrites." });
  }
});

// 5. Manual edit resume text -> creates a new version
router.post("/:id/manual-edit", async (req, res) => {
  try {
    const resume = getResume(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    const { newText } = req.body || {};
    if (!newText || typeof newText !== "string" || newText.trim().length < 50) {
      return res.status(400).json({ message: "New resume text must be at least 50 characters." });
    }

    const analysis = await analyzeResumeWithGemini(
      newText.trim(),
      resume.targetRole,
      resume.targetJobDescription
    );

    const updatedRecord = addVersion(resume.id, newText.trim(), analysis, "edit");
    res.json(updatedRecord);
  } catch (err: any) {
    console.error("Manual edit error:", err);
    res.status(500).json({ message: err.message || "Failed to update resume text." });
  }
});

// 6. Delete a resume
router.delete("/:id", (req, res) => {
  try {
    const success = deleteResume(req.params.id);
    if (!success) {
      return res.status(404).json({ message: "Resume not found." });
    }
    res.json({ success: true, message: "Resume deleted." });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to delete resume." });
  }
});

// 7. Seed sample template on demand
router.post("/sample/:sampleType", async (req, res) => {
  try {
    const sampleType = req.params.sampleType;
    let sampleFilename = "";
    let sampleText = "";
    let sampleRole = "";
    let sampleJd = "";

    if (sampleType === "product-manager") {
      sampleFilename = "Maya_Lin_Product_Manager.pdf";
      sampleRole = "Lead Technical Product Manager";
      sampleJd = "Seeking a Lead Technical Product Manager to own core platform growth, API integrations, and developer experience.";
      sampleText = `MAYA LIN
Seattle, WA | maya.lin@email.com | (206) 555-0192 | linkedin.com/in/mayalinpm

SUMMARY
Growth-focused Technical Product Manager with 6+ years driving B2B SaaS product strategy. Proven track record aligning engineering, sales, and executive stakeholders to ship scalable customer solutions.

SKILLS
Product Strategy: Roadmapping, OKR Definition, User Journey Mapping, Pricing Strategy
Technical Acumen: REST APIs, SQL Data Querying, Postman, System Architecture, AWS
Analytics & Tools: Amplitude, Mixpanel, Jira, Confluence, Figma, Segment, Google Analytics

EXPERIENCE
Senior Product Manager | CloudGrid Data | 2021 - Present
• Owned end-to-end product roadmap for enterprise developer platform with 180k monthly active API users.
• Worked with engineering team to define sprint backlogs and write user stories.
• Launched new enterprise billing tier, which helped increase subscription revenues.
• Conducted 40+ user interviews to understand customer friction and feature requests.
• Monitored weekly sprint progress and reported status to VP of Product.

Product Manager | Omnichannel Systems | 2018 - 2021
• Managed integrations with Salesforce, HubSpot, and Zapier for 1,200 commercial clients.
• Defined telemetry metrics and tracking funnels using Amplitude.
• Created product requirement documents (PRDs) and wireframes for mobile notifications.

EDUCATION
B.S. in Information Systems | University of Washington, 2018`;
    } else {
      sampleFilename = "David_Chen_Growth_Marketing.pdf";
      sampleRole = "Growth Marketing Lead";
      sampleJd = "Looking for a Growth Marketing Lead with experience running performance marketing, conversion rate optimization, and CAC/LTV payback.";
      sampleText = `DAVID CHEN
Austin, TX | david.chen@email.com | (512) 555-7821 | linkedin.com/in/davidchengrowth

SUMMARY
Digital Marketing Specialist with 4 years experience across paid search, social advertising, and email marketing campaigns.

SKILLS
Digital Channels: Google Ads, Meta Ads Manager, LinkedIn Ads, SEO, Content Marketing
Tools: Google Analytics 4, HubSpot, Klaviyo, Mailchimp, WordPress, Semrush
Core Competencies: Campaign Management, A/B Testing, Copywriting, Reporting

EXPERIENCE
Marketing Specialist | Elevate Commerce | 2022 - Present
• Responsible for managing Google and Meta ad campaigns on a monthly basis.
• Created email newsletters and promotional campaigns for retail customers.
• Wrote blog posts and SEO content to increase organic traffic.
• Assisted sales team with lead generation assets and one-pagers.
• Monitored Google Analytics to see website traffic trends.

Junior Marketing Associate | Horizon Media | 2020 - 2022
• Scheduled daily social media posts across Twitter, LinkedIn, and Instagram.
• Researched keywords for search engine optimization.
• Organized monthly marketing reports in Google Sheets.

EDUCATION
B.A. in Communications | University of Texas at Austin, 2020`;
    }

    const analysis = await analyzeResumeWithGemini(sampleText, sampleRole, sampleJd);
    const record = createResume(sampleFilename, sampleText, analysis, sampleRole, sampleJd);
    res.status(201).json(record);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to load sample resume." });
  }
});

export default router;
