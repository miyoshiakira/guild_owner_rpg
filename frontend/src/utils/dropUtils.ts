import type { DropEntry } from "../types/game";
import { ENEMY_MASTER } from "../data/masters/enemyMaster";

export function calculateDrops(enemyId: string): Record<string, number> {
  const enemy = ENEMY_MASTER.find(e => e.id === enemyId);
  if (!enemy || !enemy.drops) return {};

  const drops: Record<string, number> = {};

  enemy.drops.forEach((drop: DropEntry) => {
    if (Math.random() < drop.rate) {
      const quantity = Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1)) + drop.minQty;
      drops[drop.materialId] = (drops[drop.materialId] || 0) + quantity;
    }
  });

  return drops;
}

export function processBattleDrops(enemyIds: string[]): Record<string, number> {
  const totalDrops: Record<string, number> = {};

  enemyIds.forEach(enemyId => {
    const drops = calculateDrops(enemyId);
    Object.entries(drops).forEach(([materialId, quantity]) => {
      totalDrops[materialId] = (totalDrops[materialId] || 0) + quantity;
    });
  });

  return totalDrops;
}
