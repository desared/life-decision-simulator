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
  probability?: number;    // 0-1, likelihood this outcome occurs
  impactScore?: number;    // 0-100, how favorable the outcome is
  volatility?: number;     // 0-1, uncertainty level
}

export interface GeminiSurveyResponse {
  questions: SurveyQuestion[];
}

export interface GeminiOutcomeResponse {
  outcomes: SurveyOutcome[];
  summary: string;
  recommendation: string;
}

// Previously this file contained client-side logic to call Gemini API.
// That logic has been moved to app/actions/gemini.ts to run on the server
// for better security and reliability (avoiding CORS/key issues).

