import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);

// Simple in-memory cache with TTL
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const surveyCache = new Map<string, CacheEntry<GeminiSurveyResponse>>();
const outcomeCache = new Map<string, CacheEntry<GeminiOutcomeResponse>>();

function getCacheKey(question: string, questionCount?: number): string {
  const normalized = question.toLowerCase().trim();
  return questionCount ? `${normalized}:${questionCount}` : normalized;
}

function getFromCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  if (entry) {
    cache.delete(key); // Remove expired entry
  }
  return null;
}

function setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });

  // Clean up old entries if cache gets too large
  if (cache.size > 100) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        cache.delete(k);
      }
    }
  }
}

// Retry helper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Only retry on rate limit errors (429)
      if (!errorMessage.includes("429") && !errorMessage.includes("Resource exhausted")) {
        throw error;
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
  }[];
}

export interface SurveyOutcome {
  title: string;
  description: string;
  confidence: "high" | "medium" | "low";
  confidenceInterval: string;
  recommendation: string;
}

export interface GeminiSurveyResponse {
  questions: SurveyQuestion[];
}

export interface GeminiOutcomeResponse {
  outcomes: SurveyOutcome[];
  summary: string;
}

const getSurveyPrompt = (questionCount: number) => `You are a life decision advisor. Given a user's "Should I...?" question, generate exactly ${questionCount} thoughtful survey questions to help assess their situation.

Each question should:
- Be highly specific and directly relevant to the user's exact question
- Be introspective and help the user reflect on their unique situation
- Have 4 answer options ranging from negative to positive sentiment
- Cover different aspects: emotional readiness, financial impact, timing, support system, risks, and opportunities

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": [
        {"value": "strongly_negative", "label": "Option 1"},
        {"value": "negative", "label": "Option 2"},
        {"value": "positive", "label": "Option 3"},
        {"value": "strongly_positive", "label": "Option 4"}
      ]
    }
  ]
}`;

const OUTCOME_PROMPT = `You are a life decision advisor. Based on the user's question and their survey responses, provide thoughtful outcomes and recommendations.

Analyze the responses and provide:
1. 3 possible outcomes (best case, likely case, worst case)
2. A confidence level for each outcome
3. A specific confidence probability interval (e.g., "75-85%") for each outcome.
4. A brief recommendation for each
5. An overall summary

Do not summarize the outcomes too much, give full, detailed answers.

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "outcomes": [
    {
      "title": "Outcome title",
      "description": "Detailed description of this outcome scenario. Be specific and explain why.",
      "confidence": "high|medium|low",
      "confidenceInterval": "XX-YY%",
      "recommendation": "What to do if this outcome applies"
    }
  ],
  "summary": "Overall recommendation based on all responses"
}`;

export async function generateSurveyQuestions(
  userQuestion: string,
  questionCount: number = 4
): Promise<GeminiSurveyResponse> {
  // Check cache first
  const cacheKey = getCacheKey(userQuestion, questionCount);
  const cached = getFromCache(surveyCache, cacheKey);
  if (cached) {
    console.log("Using cached survey questions");
    return cached;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const prompt = `${getSurveyPrompt(questionCount)}

User's question: "${userQuestion}"

Generate ${questionCount} relevant survey questions for this specific decision.`;

    const parsed = await withRetry(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean up the response - remove markdown code blocks if present
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      return JSON.parse(cleanedText) as GeminiSurveyResponse;
    });

    // Cache the successful response
    setCache(surveyCache, cacheKey, parsed);

    return parsed;
  } catch (error) {
    console.error("Error generating survey questions:", error);
    // Return fallback questions based on requested count
    const allFallbackQuestions: SurveyQuestion[] = [
      {
        id: "q1",
        question: "How do you feel about your current situation?",
        options: [
          { value: "strongly_negative", label: "Very unhappy" },
          { value: "negative", label: "Somewhat unhappy" },
          { value: "positive", label: "Okay" },
          { value: "strongly_positive", label: "Very happy" },
        ],
      },
      {
        id: "q2",
        question: "Have you thoroughly researched your options?",
        options: [
          { value: "strongly_negative", label: "Not at all" },
          { value: "negative", label: "A little bit" },
          { value: "positive", label: "Quite a bit" },
          { value: "strongly_positive", label: "Extensively" },
        ],
      },
      {
        id: "q3",
        question: "How urgent is this decision for you?",
        options: [
          { value: "strongly_negative", label: "Not urgent at all" },
          { value: "negative", label: "Can wait a while" },
          { value: "positive", label: "Fairly urgent" },
          { value: "strongly_positive", label: "Very urgent" },
        ],
      },
      {
        id: "q4",
        question: "Do you have support from people you trust?",
        options: [
          { value: "strongly_negative", label: "No support" },
          { value: "negative", label: "Little support" },
          { value: "positive", label: "Some support" },
          { value: "strongly_positive", label: "Strong support" },
        ],
      },
      {
        id: "q5",
        question: "What is your financial readiness for this change?",
        options: [
          { value: "strongly_negative", label: "Not prepared at all" },
          { value: "negative", label: "Somewhat unprepared" },
          { value: "positive", label: "Reasonably prepared" },
          { value: "strongly_positive", label: "Fully prepared" },
        ],
      },
      {
        id: "q6",
        question: "How confident are you in handling potential challenges?",
        options: [
          { value: "strongly_negative", label: "Not confident" },
          { value: "negative", label: "Slightly confident" },
          { value: "positive", label: "Fairly confident" },
          { value: "strongly_positive", label: "Very confident" },
        ],
      },
    ];
    return {
      questions: allFallbackQuestions.slice(0, questionCount),
    };
  }
}

export async function generateOutcomes(
  userQuestion: string,
  answers: Record<string, { question: string; answer: string }>
): Promise<GeminiOutcomeResponse> {
  // Create cache key from question + answers
  const answersHash = Object.values(answers)
    .map((a) => a.answer)
    .join("|");
  const cacheKey = getCacheKey(`${userQuestion}:${answersHash}`);
  const cached = getFromCache(outcomeCache, cacheKey);
  if (cached) {
    console.log("Using cached outcomes");
    return cached;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const answersText = Object.entries(answers)
      .map(([, { question, answer }]) => `Q: ${question}\nA: ${answer}`)
      .join("\n\n");

    const prompt = `${OUTCOME_PROMPT}

User's original question: "${userQuestion}"

Survey responses:
${answersText}

Analyze these responses and provide outcomes.`;

    const parsed = await withRetry(async () => {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Clean up the response
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      return JSON.parse(cleanedText) as GeminiOutcomeResponse;
    });

    // Cache the successful response
    setCache(outcomeCache, cacheKey, parsed);

    return parsed;
  } catch (error) {
    console.error("Error generating outcomes:", error);
    // Return fallback outcomes
    return {
      outcomes: [
        {
          title: "Positive Outcome",
          description:
            "Based on your responses, making this change could lead to positive results.",
          confidence: "medium",
          confidenceInterval: "60-75%",
          recommendation:
            "Consider moving forward with careful planning and preparation.",
        },
        {
          title: "Neutral Outcome",
          description:
            "The situation may not change significantly either way.",
          confidence: "medium",
          confidenceInterval: "40-60%",
          recommendation:
            "Take more time to evaluate your options before deciding.",
        },
        {
          title: "Cautious Outcome",
          description:
            "There may be challenges ahead that require attention.",
          confidence: "low",
          confidenceInterval: "20-40%",
          recommendation:
            "Address potential obstacles before making a final decision.",
        },
      ],
      summary:
        "Based on your responses, we recommend taking time to carefully consider all factors before making your decision.",
    };
  }
}
