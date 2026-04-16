import type { StoryEvent } from "../../types/masters";
import storyEventsJson from './json/storyEvents.json';

export const STORY_EVENT_MASTER: StoryEvent[] = storyEventsJson as StoryEvent[];

export const STORY_EVENT_MAP: Record<string, StoryEvent> = Object.fromEntries(
  STORY_EVENT_MASTER.map((evt) => [evt.id, evt])
);

export const getEventsByMap = (mapId: string): StoryEvent[] => {
  return STORY_EVENT_MASTER.filter((evt) => evt.mapId === mapId);
};

export const getEventsByChapter = (chapter: number): StoryEvent[] => {
  return STORY_EVENT_MASTER.filter((evt) => evt.chapter === chapter);
};

export const getEventAtPosition = (mapId: string, row: number, col: number): StoryEvent[] => {
  return STORY_EVENT_MASTER.filter(
    (evt) => evt.mapId === mapId && evt.position.row === row && evt.position.col === col
  );
};