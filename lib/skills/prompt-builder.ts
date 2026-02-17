import type { SupportedLocale, EnhancedPrompt, SkillId } from "./types";
import { getSkill } from "./registry";
import { detectSkill } from "./detector";

export function buildSurveyPrompt(
  userQuestion: string,
  questionCount: number,
  locale: SupportedLocale,
  forcedSkillId?: SkillId
): EnhancedPrompt {
  const detection = forcedSkillId
    ? { skillId: forcedSkillId, confidence: "high" as const, matchedKeywords: [] }
    : detectSkill(userQuestion, locale);
  const skill = getSkill(detection.skillId);

  const languageInstruction =
    locale === "de"
      ? "\n\nIMPORTANT: All questions, options, titles, descriptions, recommendations, and summaries MUST be written in German (Deutsch)."
      : "";

  const personaBlock =
    skill.id !== "generic" ? skill.persona : "You are a decision advisor.";

  const expertiseBlock =
    skill.id !== "generic" ? `\n\n${skill.expertiseContext}` : "";

  const frameworkBlock =
    skill.id !== "generic"
      ? `\n\nQuestion categories you MUST cover (pick from these to ensure comprehensive analysis):
Required: ${skill.questionFramework.requiredCategories.join(", ")}
${
          questionCount > skill.questionFramework.requiredCategories.length
            ? `Optional (include if question count allows): ${skill.questionFramework.optionalCategories.join(", ")}`
            : ""
        }
${skill.questionFramework.phrasingSuggestions}`
      : "";

  const additionalBlock = skill.additionalInstructions
    ? `\n\n${skill.additionalInstructions}`
    : "";

  const prompt = `${personaBlock}${expertiseBlock}

Given a user's "Should I...?" question, generate exactly ${questionCount} thoughtful survey questions to help assess their situation.

Each question should:
- Be highly specific and directly relevant to the user's exact question
- Be introspective and help the user reflect on their unique situation
- Have 4 answer options ranging from negative to positive sentiment
- Cover different aspects relevant to this specific domain of decision-making
${frameworkBlock}${additionalBlock}${languageInstruction}

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
}

User's question: "${userQuestion}"

Generate ${questionCount} relevant survey questions for this specific decision.`;

  return {
    prompt,
    skillId: detection.skillId,
    detectionConfidence: detection.confidence,
  };
}

export function buildOutcomePrompt(
  userQuestion: string,
  answersText: string,
  bestCaseOnly: boolean,
  locale: SupportedLocale,
  forcedSkillId?: SkillId
): EnhancedPrompt {
  const detection = forcedSkillId
    ? { skillId: forcedSkillId, confidence: "high" as const, matchedKeywords: [] }
    : detectSkill(userQuestion, locale);
  const skill = getSkill(detection.skillId);

  const languageInstruction =
    locale === "de"
      ? "\n\nIMPORTANT: All questions, options, titles, descriptions, recommendations, and summaries MUST be written in German (Deutsch)."
      : "";

  const personaBlock =
    skill.id !== "generic" ? skill.persona : "You are a decision advisor.";

  const expertiseBlock =
    skill.id !== "generic" ? `\n\n${skill.expertiseContext}` : "";

  const evaluationBlock =
    skill.id !== "generic"
      ? `\n\nWhen evaluating outcomes, focus on these criteria:
Primary: ${skill.evaluationCriteria.primaryFactors.join(", ")}
Secondary: ${skill.evaluationCriteria.secondaryFactors.join(", ")}
${skill.evaluationCriteria.outcomeFraming}`
      : "";

  const riskBlock =
    skill.id !== "generic"
      ? `\n\nKey risk factors to consider for this type of decision:
${skill.riskFactors.map((r) => `- ${r}`).join("\n")}`
      : "";

  const benchmarkBlock =
    skill.id !== "generic"
      ? `\n\nReference these real-world benchmarks where relevant:
${skill.benchmarks.map((b) => `- ${b}`).join("\n")}`
      : "";

  const additionalBlock = skill.additionalInstructions
    ? `\n\n${skill.additionalInstructions}`
    : "";

  const outcomeInstructions = bestCaseOnly
    ? `Analyze the responses and provide:
1. 1 best-case outcome
2. A confidence level
3. A specific confidence probability interval (e.g., "75-85%")
4. A brief recommendation
5. An overall summary

Give a full, detailed answer.`
    : `Analyze the responses and provide:
1. 3 possible outcomes (best case, likely case, worst case)
2. A confidence level for each outcome
3. A specific confidence probability interval (e.g., "75-85%") for each outcome.
4. A brief recommendation for each
5. An overall summary

Do not summarize the outcomes too much, give full, detailed answers.`;

  const prompt = `${personaBlock}${expertiseBlock}

Based on the user's question and their survey responses, provide thoughtful outcomes and recommendations.
${evaluationBlock}${riskBlock}${benchmarkBlock}${additionalBlock}

${outcomeInstructions}${languageInstruction}

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
}

User's original question: "${userQuestion}"

Survey responses:
${answersText}

Analyze these responses and provide outcomes.`;

  return {
    prompt,
    skillId: detection.skillId,
    detectionConfidence: detection.confidence,
  };
}
