import type { DropEntry } from "../types/game";

/**
 * 敵1体分のドロップを抽選して返す
 */
function rollDrops(drops: DropEntry[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const drop of drops) {
    if (Math.random() < drop.rate) {
      const qty = Math.floor(Math.random() * (drop.maxQty - drop.minQty + 1)) + drop.minQty;
      result[drop.materialId] = (result[drop.materialId] ?? 0) + qty;
    }
  }
  return result;
}

/**
 * 戦闘で倒した敵リストのドロップをまとめて抽選して返す
 * 敵オブジェクトの drops フィールドを直接参照する
 */
export function processBattleDrops(enemies: { drops?: DropEntry[] }[]): Record<string, number> {
  const total: Record<string, number> = {};
  for (const enemy of enemies) {
    if (!enemy.drops) continue;
    const dropped = rollDrops(enemy.drops);
    for (const [materialId, qty] of Object.entries(dropped)) {
      total[materialId] = (total[materialId] ?? 0) + qty;
    }
  }
  return total;
}
