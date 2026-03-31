import type { Player, Monster, Enemy, Item, Equipment } from "../types/game";

// ===== テストデータ =====

export const PLAYER: Player = {
  id: "player-001",
  name: "ギルドマスター",
  level: 5,
  exp: 320,
  expNext: 500,
  gold: 1240,
  hp: 80,
  maxHp: 100,
  mp: 45,
  maxMp: 60,
  syncStatus: "synced",
};

export const MONSTERS: Monster[] = [
  {
    id: "mon-001",
    name: "スライム",
    type: "水",
    level: 3,
    hp: 40,
    maxHp: 40,
    mp: 10,
    maxMp: 10,
    atk: 12,
    def: 8,
    spd: 15,
    personality: "おとなし",
    sprite: "🟦",
    skills: ["たいあたり", "みずしぶき"],
    isParty: true,
    equipped: { weapon: null, armor: "eq-002", accessory: null },
  },
  {
    id: "mon-002",
    name: "コボルト",
    type: "地",
    level: 5,
    hp: 65,
    maxHp: 65,
    mp: 20,
    maxMp: 20,
    atk: 22,
    def: 18,
    spd: 12,
    personality: "いじっぱり",
    sprite: "🐺",
    skills: ["ひっかく", "どろだんご"],
    isParty: true,
    equipped: { weapon: "eq-001", armor: null, accessory: null },
  },
  {
    id: "mon-003",
    name: "フェアリー",
    type: "光",
    level: 4,
    hp: 30,
    maxHp: 30,
    mp: 50,
    maxMp: 50,
    atk: 8,
    def: 10,
    spd: 20,
    personality: "おっとり",
    sprite: "🧚",
    skills: ["ヒール", "ひかりのかぜ"],
    isParty: true,
    equipped: { weapon: null, armor: null, accessory: "eq-003" },
  },
  {
    id: "mon-004",
    name: "ゴブリン",
    type: "地",
    level: 2,
    hp: 35,
    maxHp: 35,
    mp: 5,
    maxMp: 5,
    atk: 10,
    def: 12,
    spd: 8,
    personality: "のんき",
    sprite: "👺",
    skills: ["たいあたり"],
    isParty: false,
    equipped: { weapon: null, armor: null, accessory: null },
  },
  {
    id: "mon-005",
    name: "ドラゴンパップ",
    type: "炎",
    level: 8,
    hp: 90,
    maxHp: 90,
    mp: 35,
    maxMp: 35,
    atk: 35,
    def: 20,
    spd: 18,
    personality: "やんちゃ",
    sprite: "🐉",
    skills: ["ひのいき", "かみつく", "たいあたり"],
    isParty: false,
    equipped: { weapon: null, armor: null, accessory: null },
  },
];

export const EQUIPMENT: Equipment[] = [
  // 武器
  { id: "eq-001", name: "ブロンズソード", slot: "weapon", effect: "ATK+10", atkBonus: 10, defBonus: 0, spdBonus: 0, sprite: "⚔️", equippedTo: "mon-002" },
  { id: "eq-004", name: "フレイムブレード", slot: "weapon", effect: "ATK+18", atkBonus: 18, defBonus: 0, spdBonus: 0, sprite: "🔥", equippedTo: null },
  { id: "eq-007", name: "ドラゴンスレイヤー", slot: "weapon", effect: "ATK+25", atkBonus: 25, defBonus: 0, spdBonus: 0, sprite: "🗡️", equippedTo: null },
  { id: "eq-009", name: "まほうのつえ", slot: "weapon", effect: "ATK+8", atkBonus: 8, defBonus: 0, spdBonus: 0, sprite: "🪄", equippedTo: null },
  // 防具
  { id: "eq-002", name: "アイアンシールド", slot: "armor", effect: "DEF+8", atkBonus: 0, defBonus: 8, spdBonus: 0, sprite: "🛡️", equippedTo: "mon-001" },
  { id: "eq-005", name: "ミスリルアーマー", slot: "armor", effect: "DEF+15", atkBonus: 0, defBonus: 15, spdBonus: 0, sprite: "✨", equippedTo: null },
  { id: "eq-010", name: "シルクローブ", slot: "armor", effect: "DEF+5", atkBonus: 0, defBonus: 5, spdBonus: 0, sprite: "👘", equippedTo: null },
  // アクセサリ
  { id: "eq-003", name: "スピードリング", slot: "accessory", effect: "SPD+5", atkBonus: 0, defBonus: 0, spdBonus: 5, sprite: "💍", equippedTo: "mon-003" },
  { id: "eq-006", name: "ラッキーチャーム", slot: "accessory", effect: "SPD+3", atkBonus: 0, defBonus: 0, spdBonus: 3, sprite: "🍀", equippedTo: null },
  { id: "eq-008", name: "エルフのブーツ", slot: "accessory", effect: "SPD+8", atkBonus: 0, defBonus: 0, spdBonus: 8, sprite: "👟", equippedTo: null },
];

export const ITEMS: Item[] = [
  { id: "item-001", name: "ポーション", type: "消耗品", quantity: 5, effect: "HP+30", sprite: "🧪" },
  { id: "item-002", name: "エーテル", type: "消耗品", quantity: 2, effect: "MP+20", sprite: "💧" },
  { id: "item-003", name: "どうのつるぎ", type: "武器", quantity: 1, effect: "ATK+8", sprite: "⚔️" },
  { id: "item-004", name: "かわのたて", type: "防具", quantity: 1, effect: "DEF+5", sprite: "🛡️" },
  { id: "item-005", name: "まほうのタマゴ", type: "特殊", quantity: 3, effect: "捕獲率+10%", sprite: "🥚" },
];

export const ENEMIES: Enemy[] = [
  { id: "e-001", name: "スライムKING", type: "水", level: 6, hp: 80, maxHp: 80, mp: 30, maxMp: 30, atk: 20, def: 10, spd: 8, sprite: "🟦", reward: { exp: 60, gold: 30 }, catchRate: 0.25 },
  { id: "e-002", name: "オーク", type: "地", level: 7, hp: 100, maxHp: 100, mp: 15, maxMp: 15, atk: 28, def: 22, spd: 6, sprite: "👹", reward: { exp: 80, gold: 40 }, catchRate: 0.15 },
  { id: "e-003", name: "ウィッチ", type: "闇", level: 8, hp: 60, maxHp: 60, mp: 80, maxMp: 80, atk: 35, def: 8, spd: 16, sprite: "🧙", reward: { exp: 100, gold: 55 }, catchRate: 0.1 },
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
