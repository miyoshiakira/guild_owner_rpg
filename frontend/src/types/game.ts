// ===== ゲームの型定義 =====

export type SyncStatus = "synced" | "pending" | "offline";
export type MonsterType = "水" | "地" | "光" | "炎" | "闇";
export type ItemType = "消耗品" | "武器" | "防具" | "特殊";
export type Scene = "login" | "guild" | "field" | "battle" | "items" | "craft";
export type NotificationSeverity = "success" | "error" | "warning" | "info";
export type EquipSlot = "weapon" | "armor" | "accessory";

export interface Player {
  id: string;
  name: string;
  level: number;
  exp: number;
  expNext: number;
  gold: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  syncStatus: SyncStatus;
}

export interface Equipment {
  id: string;
  name: string;
  slot: EquipSlot;
  effect: string;
  atkBonus: number;
  defBonus: number;
  spdBonus: number;
  sprite: string;
  equippedTo: string | null; // monster id or null (= in storage)
}

export interface Monster {
  id: string;
  name: string;
  type: MonsterType;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  spd: number;
  personality: string;
  sprite: string;
  skills: string[];
  isParty: boolean;
  equipped: Record<EquipSlot, string | null>;
}

/** ドロップテーブルの1エントリ */
export interface DropEntry {
  materialId: string;
  rate: number;    // 0.0〜1.0
  minQty: number;
  maxQty: number;
}

export interface Enemy {
  id: string;
  name: string;
  type: MonsterType;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  spd: number;
  sprite: string;
  reward: { exp: number; gold: number };
  catchRate: number;
  drops?: DropEntry[];
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  quantity: number;
  effect: string;
  sprite: string;
}

export interface Notification {
  message: string;
  severity: NotificationSeverity;
}

export interface BattleState {
  enemies: Enemy[];
  turn: number;
}

export interface GameState {
  player: Player;
  monsters: Monster[];
  equipment: Equipment[];
  items: Item[];
  materials: Record<string, number>; // materialId → 個数
  scene: Scene;
  notification: Notification | null;
  battleState: BattleState | null;
}

export type GameAction =
  | { type: "SET_SCENE"; payload: Scene }
  | { type: "NOTIFY"; payload: Notification }
  | { type: "CLEAR_NOTIFY" }
  | { type: "UPDATE_PLAYER"; payload: Partial<Player> }
  | { type: "ADD_MONSTER"; payload: Monster }
  | { type: "START_BATTLE"; payload: BattleState }
  | { type: "END_BATTLE" }
  | { type: "EQUIP"; payload: { equipmentId: string; monsterId: string; slot: EquipSlot } }
  | { type: "UNEQUIP"; payload: { equipmentId: string } }
  | { type: "LOAD_SAVE"; payload: Partial<Pick<GameState, "player" | "monsters" | "equipment" | "items" | "materials">> }
  | { type: "SET_PARTY"; payload: { monsterId: string; isParty: boolean } }
  | { type: "ADD_MATERIALS"; payload: Record<string, number> }
  | { type: "CRAFT"; payload: import("./masters").CraftRecipe };
