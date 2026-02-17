import type { DetectionResult, SkillId, SupportedLocale } from "./types";
import { getAllSkills } from "./registry";

export function detectSkill(
  userQuestion: string,
  locale: SupportedLocale = "en"
): DetectionResult {
  const normalizedQuestion = userQuestion.toLowerCase().trim();
  const skills = getAllSkills();

  let bestMatch: {
    skillId: SkillId;
    score: number;
    matchedKeywords: string[];
  } = {
    skillId: "generic",
    score: 0,
    matchedKeywords: [],
  };

  for (const skill of skills) {
    const keywords =
      locale === "de"
        ? [...skill.keywords, ...skill.keywordsDe]
        : skill.keywords;

    const matchedKeywords: string[] = [];
    let score = 0;

    for (const keyword of keywords) {
      if (normalizedQuestion.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
        // Multi-word keywords are stronger signals
        score += keyword.includes(" ") ? 3 : 1;
      }
    }

    if (score > bestMatch.score) {
      bestMatch = { skillId: skill.id, score, matchedKeywords };
    }
  }

  let confidence: DetectionResult["confidence"];
  if (bestMatch.score >= 4) {
    confidence = "high";
  } else if (bestMatch.score >= 2) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  return {
    skillId: bestMatch.score > 0 ? bestMatch.skillId : "generic",
    confidence,
    matchedKeywords: bestMatch.matchedKeywords,
  };
}
