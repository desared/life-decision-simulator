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

