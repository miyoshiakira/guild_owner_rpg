// ===== ゲームの型定義 =====

export type SyncStatus = "synced" | "pending" | "offline";
export type MonsterType = "水" | "地" | "光" | "炎" | "闇";
export type ItemType = "消耗品" | "武器" | "防具" | "特殊";
export type Scene = "login" | "guild" | "field" | "roster" | "battle";
export type NotificationSeverity = "success" | "error" | "warning" | "info";

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
  enemy: Enemy;
  turn: number;
}

export interface GameState {
  player: Player;
  monsters: Monster[];
  items: Item[];
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
  | { type: "END_BATTLE" };
