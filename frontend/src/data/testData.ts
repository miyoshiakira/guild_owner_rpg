import type { Player, Monster, Enemy, Item, Equipment } from "../types/game";

// ===== テストデータ =====

export const PLAYER: Player = {
  id: "player-001",
  name: "ギルドマスター",
  level: 1,
  exp: 0,
  expNext: 100,
  gold: 50,
  hp: 50,
  maxHp: 50,
  mp: 20,
  maxMp: 20,
  syncStatus: "synced",
};

export const MONSTERS: Monster[] = [
  {
    id: "mon-001",
    name: "男の子",
    type: "地",
    level: 1,
    hp: 38,
    maxHp: 38,
    mp: 8,
    maxMp: 8,
    atk: 13,
    def: 9,
    spd: 10,
    personality: "いじっぱり",
    sprite: "DefaultBoy.png",
    skills: ["なぐる", "おたけび"],
    isParty: true,
    equipped: { weapon: null, armor: null, accessory: null },
  },
  {
    id: "mon-002",
    name: "女の子",
    type: "光",
    level: 1,
    hp: 28,
    maxHp: 28,
    mp: 22,
    maxMp: 22,
    atk: 8,
    def: 7,
    spd: 13,
    personality: "おっとり",
    sprite: "DefaultGirl.png",
    skills: ["ヒール", "ひかりのかぜ"],
    isParty: true,
    equipped: { weapon: null, armor: null, accessory: null },
  },
  {
    id: "mon-003",
    name: "スライム",
    type: "水",
    level: 1,
    hp: 42,
    maxHp: 42,
    mp: 6,
    maxMp: 6,
    atk: 9,
    def: 13,
    spd: 7,
    personality: "のんき",
    sprite: "SlimeBasic.png",
    skills: ["たいあたり", "みずしぶき"],
    isParty: true,
    equipped: { weapon: null, armor: null, accessory: null },
  },
];

export const EQUIPMENT: Equipment[] = [
  // 武器
  { id: "eq-001", name: "石の剣", slot: "weapon", effect: "ATK+4", atkBonus: 4, defBonus: 0, spdBonus: 0, sprite: "🗡️", equippedTo: null },
  { id: "eq-002", name: "石の剣", slot: "weapon", effect: "ATK+4", atkBonus: 4, defBonus: 0, spdBonus: 0, sprite: "🗡️", equippedTo: null },
  // 防具
  { id: "eq-003", name: "皮の鎧", slot: "armor", effect: "DEF+3", atkBonus: 0, defBonus: 3, spdBonus: 0, sprite: "🥋", equippedTo: null },
  { id: "eq-004", name: "皮の鎧", slot: "armor", effect: "DEF+3", atkBonus: 0, defBonus: 3, spdBonus: 0, sprite: "🥋", equippedTo: null },
  // アクセサリ
  { id: "eq-005", name: "スライムぼうし", slot: "accessory", effect: "DEF+2 SPD+1", atkBonus: 0, defBonus: 2, spdBonus: 1, sprite: "🪣", equippedTo: null },
];

export const ITEMS: Item[] = [];

export const ENEMIES: Enemy[] = [
  { id: "e-001", name: "スライムKING", type: "水", level: 6, hp: 80, maxHp: 80, mp: 30, maxMp: 30, atk: 20, def: 10, spd: 8, sprite: "SlimeBasic.png", reward: { exp: 60, gold: 30 }, catchRate: 0.25 },
  { id: "e-002", name: "オーク", type: "地", level: 7, hp: 100, maxHp: 100, mp: 15, maxMp: 15, atk: 28, def: 22, spd: 6, sprite: "DefaultBoy.png", reward: { exp: 80, gold: 40 }, catchRate: 0.15 },
  { id: "e-003", name: "ウィッチ", type: "闇", level: 8, hp: 60, maxHp: 60, mp: 80, maxMp: 80, atk: 35, def: 8, spd: 16, sprite: "DefaultGirl.png", reward: { exp: 100, gold: 55 }, catchRate: 0.1 },
];

// 2Dタイルマップ (0=草, 1=水, 2=木, 3=岩, 4=道, 5=町, 6=ダンジョン)
export const TILE_MAP: number[][] = [
  [2, 2, 0, 0, 0, 0, 0, 2, 2, 2],
  [2, 0, 0, 4, 4, 4, 0, 0, 2, 2],
  [0, 0, 4, 4, 5, 4, 4, 0, 0, 2],
  [0, 4, 4, 0, 4, 0, 4, 4, 0, 0],
  [0, 4, 0, 0, 4, 0, 0, 4, 0, 0],
  [1, 1, 0, 0, 4, 0, 0, 0, 3, 0],
  [1, 1, 1, 0, 4, 4, 0, 0, 3, 0],
  [0, 1, 0, 0, 0, 4, 4, 0, 0, 0],
  [0, 0, 0, 3, 0, 0, 4, 4, 6, 0],
  [0, 0, 3, 3, 0, 0, 0, 0, 6, 0],
];

export const TILE_COLORS: Record<number, string> = {
  0: "#4a7c59",
  1: "#3a7bd5",
  2: "#2d5a1b",
  3: "#7a6a5a",
  4: "#c8a96a",
  5: "#e8d5a3",
  6: "#4a3a6a",
};

export const TILE_SYMBOLS: Record<number, string> = {
  0: "",
  1: "≋",
  2: "🌲",
  3: "⛰",
  4: "",
  5: "🏘",
  6: "⚔",
};

export const ENEMY_SPAWN_TILES: number[] = [0, 3];
