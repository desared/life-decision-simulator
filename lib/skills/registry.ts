import type { Skill, SkillId } from "./types";
import { genericSkill } from "./skills/generic";
import { financeSkill } from "./skills/finance";
import { careerSkill } from "./skills/career";
import { healthSkill } from "./skills/health";
import { relationshipsSkill } from "./skills/relationships";
import { educationSkill } from "./skills/education";
import { realEstateSkill } from "./skills/real-estate";
import { lifestyleSkill } from "./skills/lifestyle";
import { businessSkill } from "./skills/business";

const skillMap: Record<SkillId, Skill> = {
  finance: financeSkill,
  career: careerSkill,
  health: healthSkill,
  relationships: relationshipsSkill,
  education: educationSkill,
  "real-estate": realEstateSkill,
  lifestyle: lifestyleSkill,
  business: businessSkill,
  generic: genericSkill,
};

export function getAllSkills(): Skill[] {
  return Object.values(skillMap).filter((s) => s.id !== "generic");
}

export function getSkill(id: SkillId): Skill {
  return skillMap[id] ?? skillMap.generic;
}

export function getGenericSkill(): Skill {
  return skillMap.generic;
}

export function getSkillIds(): SkillId[] {
  return Object.keys(skillMap).filter((k) => k !== "generic") as SkillId[];
}

export function hasSkill(id: string): id is SkillId {
  return id in skillMap;
}
