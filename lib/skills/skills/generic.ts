import type { Skill } from "../types";

export const genericSkill: Skill = {
  id: "generic",
  name: "Decision Advisor",
  displayName: {
    en: "Decision Advisor",
    de: "Entscheidungsberater",
  },
  icon: "HelpCircle",
  keywords: [],
  keywordsDe: [],
  persona: "You are a decision advisor.",
  expertiseContext: "",
  questionFramework: {
    requiredCategories: [
      "emotional readiness",
      "financial impact",
      "timing",
      "support system",
    ],
    optionalCategories: ["risks", "opportunities"],
    phrasingSuggestions: "",
  },
  evaluationCriteria: {
    primaryFactors: [
      "Overall life impact",
      "Financial implications",
      "Emotional readiness",
      "Timing appropriateness",
    ],
    secondaryFactors: ["Support network", "Risk tolerance"],
    outcomeFraming: "",
  },
  riskFactors: [],
  benchmarks: [],
  confidenceProfile: "qualitative",
};
