export type SkillId =
  | "finance"
  | "career"
  | "health"
  | "relationships"
  | "education"
  | "real-estate"
  | "lifestyle"
  | "business"
  | "generic";

export type SupportedLocale = "en" | "de";

export interface QuestionFramework {
  requiredCategories: string[];
  optionalCategories: string[];
  phrasingSuggestions: string;
}

export interface EvaluationCriteria {
  primaryFactors: string[];
  secondaryFactors: string[];
  outcomeFraming: string;
}

export interface Skill {
  id: SkillId;
  name: string;
  displayName: Record<SupportedLocale, string>;
  icon: string;
  keywords: string[];
  keywordsDe: string[];
  persona: string;
  expertiseContext: string;
  questionFramework: QuestionFramework;
  evaluationCriteria: EvaluationCriteria;
  riskFactors: string[];
  benchmarks: string[];
  confidenceProfile: "quantitative" | "qualitative" | "mixed";
  additionalInstructions?: string;
}

export interface DetectionResult {
  skillId: SkillId;
  confidence: "high" | "medium" | "low";
  matchedKeywords: string[];
}

export interface EnhancedPrompt {
  prompt: string;
  skillId: SkillId;
  detectionConfidence: "high" | "medium" | "low";
}
