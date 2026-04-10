import type { StoryEvent } from "../types/masters";
import type { MapMasterData } from "../data/masters/mapMaster";
import { MAP_TILE_MASTER } from "../data/map/mapChipConfig";

export function filterVisibleEvents(
  events: StoryEvent[],
  completedEvents: string[],
  storyFlags: Record<string, boolean>,
  currentMap: MapMasterData
): StoryEvent[] {
  return events.filter(e => {
    if (completedEvents.includes(e.id)) return false;
    
    if (e.prerequisites) {
      return e.prerequisites.every(flag => (storyFlags[flag] ?? false) === true);
    }
    
    if (e.conditions) {
      return e.conditions.every(c => {
        if (c.type === "flag") {
          const flagValue = storyFlags[c.flag!] ?? false;
          return flagValue === c.value;
        }
        return true;
      });
    }
    
    const tileAtEvent = currentMap.tileMap[e.position.row]?.[e.position.col];
    if (tileAtEvent !== undefined) {
      const tileConfig = MAP_TILE_MASTER[tileAtEvent];
      if (tileConfig && !tileConfig.walkable) {
        return false;
      }
    }
    
    return true;
  });
}
