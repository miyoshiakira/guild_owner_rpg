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
}

/**
 * 指定したキーのデータを IndexedDB に保存する。
 * 各値は JSON 文字列として格納される。
 */
export async function saveGameData(data: Partial<SavedGameData>): Promise<void> {
  const entries = Object.entries(data).map(([key, value]) => ({
    key,
    value: JSON.stringify(value),
  }));
  await db.saveData.bulkPut(entries);
}

/**
 * IndexedDB から全セーブデータを読み込む。
 * キーが存在しないフィールドは含まれない。
 */
export async function loadGameData(): Promise<Partial<SavedGameData>> {
  const entries = await db.saveData.toArray();
  return Object.fromEntries(
    entries.map(({ key, value }) => [key, JSON.parse(value)])
  ) as Partial<SavedGameData>;
}

/** セーブデータが 1 件以上存在するか */
export async function hasSaveData(): Promise<boolean> {
  return (await db.saveData.count()) > 0;
}

/** セーブデータを全消去 */
export async function deleteSaveData(): Promise<void> {
  await db.saveData.clear();
}
