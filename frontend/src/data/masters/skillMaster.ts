import type { SkillMaster } from "../../types/masters";
import skillsJson from './json/skills.json';

export const SKILL_MASTER: SkillMaster[] = skillsJson as SkillMaster[];

/** name → SkillMaster の引きマップ */
export const SKILL_MAP: Record<string, SkillMaster> = Object.fromEntries(
  SKILL_MASTER.map((s) => [s.name, s])
);

/** id → SkillMaster の引きマップ */
export const SKILL_ID_MAP: Record<string, SkillMaster> = Object.fromEntries(
  SKILL_MASTER.map((s) => [s.id, s])
);