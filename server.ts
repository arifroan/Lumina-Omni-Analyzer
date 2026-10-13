import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize GoogleGenAI client with required User-Agent
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface AnalysisPayload {
  domain: 'auto' | 'code' | 'prose' | 'data' | 'legal' | 'image' | 'web';
  content: string;
  mediaData?: string;
  mediaMime?: string;
  depth?: 'standard' | 'deep' | 'executive' | 'academic';
  customPrompt?: string;
}

const analysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'Clear, insightful title of this analysis evaluation',
    },
    domain: {
      type: Type.STRING,
      description: 'Detected or analyzed domain: code, prose, data, legal, image, or web',
    },
    verdict: {
      type: Type.STRING,
      description: 'One punchy, authoritative sentence summarizing the overall state or conclusion',
    },
    overallScore: {
      type: Type.INTEGER,
      description: 'Overall quality or safety score from 0 to 100',
    },
    overallGrade: {
      type: Type.STRING,
      description: 'Letter grade or status: e.g. A+, A, B, C, Critical Risk, Production Ready',
    },
    executiveSummary: {
      type: Type.STRING,
      description: 'Crisp 2-3 paragraph professional diagnostic summary of findings and context',
    },
    sentimentOrTone: {
      type: Type.STRING,
      description: 'Qualitative tone or posture detected, e.g. "Defensive & Rigid", "Clean & Idiomatic", "Ambiguous & Risky"',
    },
    metrics: {
      type: Type.ARRAY,
      description: '3 to 5 domain-specific quantitative or benchmark metrics',
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          score: { type: Type.INTEGER, description: 'Score between 0 and 100' },
          grade: { type: Type.STRING, description: 'Short badge value, e.g. "94/100", "Low Risk", "O(n)"' },
          benchmark: { type: Type.STRING, description: 'Industry benchmark comparison or criteria' },
          description: { type: Type.STRING, description: 'Brief explanation of this metric' },
        },
        required: ['label', 'score', 'grade', 'benchmark', 'description'],
      },
    },
    keyStrengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of 3-5 confirmed strengths or well-executed aspects',
    },
    primaryWeaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of 2-5 major vulnerabilities, bottlenecks, flaws, or risks',
    },
    findings: {
      type: Type.ARRAY,
      description: 'Granular diagnostic findings, issues, or observations',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          category: { type: Type.STRING, description: 'Category e.g. Security, Performance, Readability, Bias, Compliance, UX' },
          severity: { type: Type.STRING, description: 'critical, warning, info, or positive' },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          location: { type: Type.STRING, description: 'Line, section, paragraph, or element location if applicable' },
          recommendation: { type: Type.STRING, description: 'Precise actionable fix or adjustment' },
          codeSnippet: { type: Type.STRING, description: 'Original problematic excerpt if applicable' },
          suggestedFix: { type: Type.STRING, description: 'Specific replacement excerpt or improved snippet' },
        },
        required: ['id', 'category', 'severity', 'title', 'description', 'recommendation'],
      },
    },
    actionItems: {
      type: Type.ARRAY,
      description: 'Prioritized sequential roadmap to address issues',
      items: {
        type: Type.OBJECT,
        properties: {
          priority: { type: Type.STRING, description: 'high, medium, or low' },
          task: { type: Type.STRING },
          expectedImpact: { type: Type.STRING },
        },
        required: ['priority', 'task', 'expectedImpact'],
      },
    },
    improvedVersion: {
      type: Type.OBJECT,
      description: 'An improved, refactored, or optimized version of the artifact',
      properties: {
        label: { type: Type.STRING, description: 'Label, e.g. "Refactored & Hardened Code", "Executive Polish Rewrite"' },
        description: { type: Type.STRING, description: 'Key changes made in this version' },
        content: { type: Type.STRING, description: 'The complete rewritten/refactored content' },
      },
      required: ['label', 'description', 'content'],
    },
    dataInsights: {
      type: Type.OBJECT,
      description: 'Optional stats and chart suggestions (especially for data, table, metrics, or financial inputs)',
      properties: {
        summaryStats: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              value: { type: Type.STRING },
            },
            required: ['label', 'value'],
          },
        },
        chartSuggestion: {
          type: Type.OBJECT,
          properties: {
            chartType: { type: Type.STRING, description: 'bar, line, or pie' },
            title: { type: Type.STRING },
            xAxisLabel: { type: Type.STRING },
            yAxisLabel: { type: Type.STRING },
            dataPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                },
                required: ['label', 'value'],
              },
            },
          },
          required: ['chartType', 'title', 'dataPoints'],
        },
      },
    },
  },
  required: [
    'title',
    'domain',
    'verdict',
    'overallScore',
    'overallGrade',
    'executiveSummary',
    'metrics',
    'keyStrengths',
    'primaryWeaknesses',
    'findings',
    'actionItems',
  ],
};

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Primary Analyzer endpoint
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { domain = 'auto', content = '', mediaData, mediaMime, depth = 'standard', customPrompt = '' }: AnalysisPayload = req.body;

    if (!content.trim() && !mediaData) {
      res.status(400).json({ error: 'Please provide text content or media to analyze.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured on the server. Please check the Secrets settings.',
      });
      return;
    }

    const systemInstruction = `You are Lumina AI Analyzer, an elite multi-domain forensic analysis and intelligence engine.
Your purpose is to deliver uncompromising, deep, rigorous, and actionable evaluations across software code, written prose, tabular/numerical data, contracts/legal texts, UI/visual media, and web assets.

Guidelines:
1. Provide concrete, technical, and objective assessments. Avoid vague fluff, clichés, or ungrounded praise.
2. Formulate 3-5 domain-relevant metrics with realistic 0-100 scores and benchmarks:
   - For Code: Security Posture, Algorithmic Efficiency, Maintainability Index, Testability, Fault Tolerance.
   - For Prose: Readability Grade (e.g. Flesch-Kincaid), Logical Coherence, Rhetorical Persuasiveness, Tone Alignment, Conciseness.
   - For Data: Statistical Integrity, Distribution Normality, Outlier Density, Completeness, Actionability.
   - For Legal/Contracts: Risk Exposure, Obligation Asymmetry, Liability Ceiling Clarity, Ambiguity Index, Termination Safety.
   - For Image/Visuals: Visual Hierarchy, Information Density, Contrast & Accessibility, Aesthetic Balance, Semantic Clarity.
   - For Web/SEO: Conversion Friction, Semantic Structure, Value Proposition Clarity, Meta/SEO Readability, CTA Prominence.
3. Classify findings accurately into severity: 'critical' (urgent vulnerability, fatal logic flaw, severe loophole), 'warning' (performance risk, ambiguity, anti-pattern), 'info' (code smell, stylistic tweak, readability note), or 'positive' (praiseworthy engineering/writing decision).
4. For findings with flaws, ALWAYS provide the exact location, concrete recommendation, and both 'codeSnippet' (problematic part) and 'suggestedFix' (remedy).
5. ALWAYS provide an 'improvedVersion' with the full refactored, polished, or revised output so the user can directly benefit from the fix.
6. When analyzing tabular, CSV, or quantitative data, populate 'dataInsights' with summary stats and chart dataPoints for visual representation.
7. Tone must be professional, direct, authoritative, and immensely useful.`;

    const userPromptText = `Analyze the following target input:
Requested Domain: ${domain}
Depth Profile: ${depth}
${customPrompt ? `User Custom Focus/Instruction: ${customPrompt}` : ''}

Target Input Content:
"""
${content || '(Media asset provided below)'}
"""

Please run a comprehensive analysis and return a structured JSON response matching the schema.`;

    const contentsParts: any[] = [];
    if (mediaData && mediaMime) {
      contentsParts.push({
        inlineData: {
          mimeType: mediaMime,
          data: mediaData.replace(/^data:image\/[a-zA-Z]+;base64,/, ''),
        },
      });
    }
    contentsParts.push({ text: userPromptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsParts,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: analysisResponseSchema,
        temperature: 0.2,
      },
    });

    const rawText = response.text || '';
    let parsedResult;
    try {
      parsedResult = JSON.parse(rawText);
    } catch {
      // Clean possible markdown wrapper
      const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    res.json({
      success: true,
      analysis: parsedResult,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to complete analysis.',
      details: error?.toString(),
    });
  }
});

// Follow-up Interactive Chat Endpoint for the Analyzed Artifact
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { analysisContext, messages = [], question = '' } = req.body;

    if (!question.trim()) {
      res.status(400).json({ error: 'Question is required.' });
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({ error: 'GEMINI_API_KEY is missing.' });
      return;
    }

    const systemInstruction = `You are the lead intelligence specialist for this analysis report.
You have access to the context of the analyzed artifact:
Title: ${analysisContext?.title || 'User Artifact'}
Domain: ${analysisContext?.domain || 'General'}
Executive Summary: ${analysisContext?.executiveSummary || ''}
Key Verdict: ${analysisContext?.verdict || ''}
Findings: ${JSON.stringify(analysisContext?.findings?.slice(0, 5) || [])}

Answer the user's questions with exact precision, code examples, clause revisions, or deeper explanations.
Be concise, clear, and highly practical. Avoid generic filler.`;

    const chatContents: any[] = [];
    for (const msg of messages) {
      chatContents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    }
    chatContents.push({
      role: 'user',
      parts: [{ text: question }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({
      success: true,
      reply: response.text || 'No response generated.',
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate answer.',
    });
  }
});

// Mount Vite or serve static build
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lumina AI Analyzer server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
