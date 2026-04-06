import { db } from "./saveDb";
import type { Player, Monster, Equipment, Item } from "../types/game";

export interface PlayerPos {
  row: number;
  col: number;
}

/** IndexedDB に保存するデータ全体 */
export interface SavedGameData {
  player: Player;
  monsters: Monster[];
  equipment: Equipment[];
  items: Item[];
  materials: Record<string, number>;
  playerPos: PlayerPos;
  currentMapId: string;
  visitedMapIds: string[];
  isAutoBattle: boolean;
}

/** スロット表示用のサマリー情報 */
export interface SlotSummary {
  slotId: number;
  exists: boolean;
  playerName?: string;
  playerLevel?: number;
  gold?: number;
  savedAt?: string; // ISO 文字列
}

interface SlotMeta {
  savedAt: string;
  playerName: string;
  playerLevel: number;
  gold: number;
}

const metaKey = (slotId: number) => `slot${slotId}:_meta`;
const dataKey = (slotId: number, field: string) => `slot${slotId}:${field}`;

/** マップ位置のみを軽量保存する（1歩ごとのデバウンスセーブ用） */
export async function saveMapPosition(
  slotId: number,
  playerPos: PlayerPos,
  currentMapId: string,
): Promise<void> {
  await db.saveData.bulkPut([
    { key: dataKey(slotId, "playerPos"),    value: JSON.stringify(playerPos) },
    { key: dataKey(slotId, "currentMapId"), value: JSON.stringify(currentMapId) },
  ]);
}

/** マップ位置のみを読み込む */
export async function loadMapPosition(
  slotId: number,
): Promise<{ playerPos?: PlayerPos; currentMapId?: string }> {
  const posEntry  = await db.saveData.get(dataKey(slotId, "playerPos"));
  const mapEntry  = await db.saveData.get(dataKey(slotId, "currentMapId"));
  return {
    playerPos:    posEntry  ? JSON.parse(posEntry.value)  : undefined,
    currentMapId: mapEntry  ? JSON.parse(mapEntry.value)  : undefined,
  };
}

/** 指定スロットにデータを保存する */
export async function saveGameData(data: Partial<SavedGameData>, slotId: number): Promise<void> {
  const entries = Object.entries(data).map(([key, value]) => ({
    key: dataKey(slotId, key),
    value: JSON.stringify(value),
  }));
  await db.saveData.bulkPut(entries);
}

/** スロットのメタ情報（表示用）を更新する */
export async function saveSlotMeta(slotId: number, meta: SlotMeta): Promise<void> {
  await db.saveData.put({ key: metaKey(slotId), value: JSON.stringify(meta) });
}

/** 指定スロットのデータを読み込む */
export async function loadGameData(slotId: number): Promise<Partial<SavedGameData>> {
  const prefix = `slot${slotId}:`;
  const all = await db.saveData.toArray();
  const entries = all
    .filter(({ key }) => key.startsWith(prefix) && key !== metaKey(slotId))
    .map(({ key, value }) => [key.slice(prefix.length), JSON.parse(value)]);
  return Object.fromEntries(entries) as Partial<SavedGameData>;
}

/** 指定スロットにセーブデータが存在するか */
export async function hasSaveData(slotId: number): Promise<boolean> {
  const count = await db.saveData
    .filter(({ key }) => key.startsWith(`slot${slotId}:`) && key !== metaKey(slotId))
    .count();
  return count > 0;
}

/** 指定スロットのデータを全消去 */
export async function deleteSaveData(slotId: number): Promise<void> {
  const all = await db.saveData.toArray();
  const keys = all
    .filter(({ key }) => key.startsWith(`slot${slotId}:`))
    .map(({ key }) => key);
  await db.saveData.bulkDelete(keys);
}

/** 全スロット（1〜3）のサマリーを返す */
export async function getSlotSummaries(): Promise<SlotSummary[]> {
  const all = await db.saveData.toArray();

  return [1, 2, 3].map((slotId) => {
    const prefix = `slot${slotId}:`;
    const slotEntries = all.filter(({ key }) => key.startsWith(prefix));
    if (slotEntries.length === 0) return { slotId, exists: false };

    // メタ情報があれば優先して使う
    const metaEntry = slotEntries.find(({ key }) => key === metaKey(slotId));
    if (metaEntry) {
      const meta: SlotMeta = JSON.parse(metaEntry.value);
      return { slotId, exists: true, ...meta };
    }

    // メタなし → player データから補完
    const playerEntry = slotEntries.find(({ key }) => key === dataKey(slotId, "player"));
    if (playerEntry) {
      const player = JSON.parse(playerEntry.value) as Player;
      return { slotId, exists: true, playerName: player.name, gold: player.gold };
    }

    return { slotId, exists: true };
  });
}
