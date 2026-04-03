import type { Player, Monster, Item, Equipment } from "../types/game";

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

// 初期パーティメンバーのみ（スカウトで加入するキャラは enemyMaster で管理）
export const MONSTERS: Monster[] = [
  {
    id: "mon-001",
    name: "男性剣士",
    type: "地",
    level: 1,
    hp: 40, maxHp: 40, mp: 10, maxMp: 10,
    atk: 14, def: 10, spd: 9,
    personality: "いじっぱり",
    sprite: "男性剣士.png",
    skills: ["なぐる", "かばう"],
    isParty: true,
    equipped: { weapon: null, armor: null, accessory: null },
    exp: 0, expNext: 50,
  },
  {
    id: "mon-002",
    name: "女性剣士",
    type: "光",
    level: 1,
    hp: 30, maxHp: 30, mp: 24, maxMp: 24,
    atk: 10, def: 8, spd: 14,
    personality: "おっとり",
    sprite: "女性剣士.png",
    skills: ["ヒール", "ひかりのかぜ"],
    isParty: true,
    equipped: { weapon: null, armor: null, accessory: null },
    exp: 0, expNext: 50,
  },
  {
    id: "mon-003",
    name: "スライム",
    type: "水",
    level: 1,
    hp: 44, maxHp: 44, mp: 8, maxMp: 8,
    atk: 8, def: 14, spd: 6,
    personality: "のんき",
    sprite: "スライム.png",
    skills: ["たいあたり", "みずしぶき"],
    isParty: true,
    equipped: { weapon: null, armor: null, accessory: null },
    exp: 0, expNext: 50,
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

export const ITEMS: Item[] = [
  { id: "potion-001", name: "回復ポーション",  type: "消耗品", quantity: 3, effect: "HPを30回復",  sprite: "🧪" },
  { id: "potion-002", name: "魔力ポーション",  type: "消耗品", quantity: 2, effect: "MPを20回復",  sprite: "💙" },
  { id: "potion-003", name: "ハイポーション",  type: "消耗品", quantity: 1, effect: "HPを80回復",  sprite: "🍶" },
  { id: "antidote-001", name: "どくけし草",    type: "消耗品", quantity: 2, effect: "毒を解除する", sprite: "🌿" },
];

// 2Dタイルマップ (0=草, 1=水, 2=木, 3=岩, 4=道, 5=町, 6=ダンジョン, 7=砂漠, 8=雪原)
export const TILE_MAP: number[][] = [
  [2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 8, 8, 8, 8, 2, 2, 2, 2, 2],
  [2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 8, 3, 3, 8, 8, 8, 2, 2, 2, 2],
  [2, 2, 0, 0, 4, 4, 4, 0, 0, 8, 3, 3, 8, 8, 4, 8, 8, 2, 2, 2],
  [2, 0, 0, 4, 5, 4, 4, 0, 0, 0, 8, 8, 8, 4, 4, 4, 8, 8, 6, 2],
  [0, 0, 4, 4, 0, 4, 0, 0, 0, 0, 0, 4, 4, 4, 4, 8, 8, 8, 3, 2],
  [1, 0, 0, 0, 4, 0, 0, 3, 3, 0, 0, 4, 0, 0, 4, 0, 3, 3, 2, 2],
  [1, 1, 0, 0, 4, 4, 0, 3, 0, 0, 0, 4, 0, 0, 0, 4, 0, 3, 3, 2],
  [0, 1, 1, 0, 0, 4, 4, 0, 0, 0, 4, 4, 0, 0, 0, 4, 4, 0, 3, 2],
  [0, 0, 1, 0, 0, 0, 4, 4, 6, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0],
  [0, 0, 0, 3, 0, 0, 0, 4, 4, 4, 4, 0, 0, 6, 0, 0, 4, 0, 0, 0],
  [0, 0, 3, 3, 0, 5, 4, 4, 0, 0, 4, 4, 0, 0, 0, 0, 4, 4, 0, 0],
  [0, 3, 3, 0, 4, 4, 0, 0, 0, 0, 0, 4, 4, 0, 0, 7, 7, 4, 4, 0],
  [0, 3, 0, 0, 4, 0, 0, 0, 0, 3, 3, 0, 4, 4, 7, 7, 7, 7, 4, 0],
  [0, 0, 0, 4, 4, 0, 0, 3, 3, 0, 0, 0, 0, 4, 7, 7, 7, 7, 7, 7],
  [1, 0, 4, 4, 0, 0, 3, 3, 0, 0, 0, 6, 0, 4, 4, 7, 7, 7, 5, 7],
  [1, 1, 4, 0, 5, 4, 4, 4, 4, 0, 0, 0, 0, 0, 4, 4, 7, 7, 7, 7],
  [1, 1, 0, 4, 0, 0, 0, 4, 0, 0, 0, 0, 6, 0, 0, 4, 4, 7, 7, 7],
  [1, 0, 0, 4, 0, 0, 0, 4, 4, 4, 4, 0, 0, 0, 0, 0, 4, 4, 7, 7],
  [0, 0, 3, 4, 3, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 0, 4, 7],
  [0, 3, 3, 0, 3, 0, 0, 0, 0, 4, 6, 0, 0, 0, 0, 5, 0, 4, 4, 0],
];

export const TILE_COLORS: Record<number, string> = {
  0: "#4a7c59",
  1: "#3a7bd5",
  2: "#2d5a1b",
  3: "#7a6a5a",
  4: "#c8a96a",
  5: "#e8d5a3",
  6: "#4a3a6a",
  7: "#c8960a",
  8: "#c8e0f0",
};

export const TILE_SYMBOLS: Record<number, string> = {
  0: "",
  1: "≋",
  2: "🌲",
  3: "⛰",
  4: "",
  5: "🏘",
  6: "⚔",
  7: "🏜",
  8: "❄",
};

export const ENEMY_SPAWN_TILES: number[] = [0, 7, 8];
