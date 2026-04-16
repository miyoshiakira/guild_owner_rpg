import type { StoryNPC } from "../../types/masters";
import storyNPCsJson from './json/storyNPCs.json';

export const STORY_NPC_MASTER: StoryNPC[] = storyNPCsJson as StoryNPC[];

export const STORY_NPC_MAP: Record<string, StoryNPC> = Object.fromEntries(
  STORY_NPC_MASTER.map((npc) => [npc.id, npc])
);