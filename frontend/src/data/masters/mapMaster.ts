/**
 * マップマスタ
 * タイル種別:
 *   0=草原/空地  1=水辺/溶岩(通行不可)  2=森(通行不可)  3=岩場(通行不可)
 *   4=道         5=町/砦               6=ダンジョン    7=砂漠
 *   8=雪原       9=出口ポータル
 */

import mapTransitionsJson from './mapTransitions.json';
import mapMasterAdditionsJson from './mapMasterAdditions.json';

import {
  MAP1_TILES,
  MAP2_TILES,
  MAP3_TILES,
  MAP4_TILES,
  MAP5_TILES,
  MAP6_TILES,
  MAP7_TILES,
  MAP8_TILES,
  MAP9_TILES,
  MAP10_TILES,
  MAP11_TILES,
  MAP12_TILES,
  MAP13_TILES,
  MAP14_TILES,
  MAP15_TILES,
  MAP16_TILES,
  MAP17_TILES,
  MAP18_TILES,
} from "./mapCellMaster";

// ── タイル種別 Enum ────────────────────────────────────────────────────────
export enum TileType {
  GRASS = 0,    // 草原/空地
  WATER = 1,    // 水辺/溶岩(通行不可)
  FOREST = 2,   // 森(通行不可)
  ROCK = 3,     // 岩場(通行不可)
  ROAD = 4,     // 道
  TOWN = 5,     // 町/砦
  DUNGEON = 6,  // ダンジョン
  DESERT = 7,   // 砂漠
  SNOW = 8,     // 雪原
  PORTAL = 9,   // 出口ポータル
}

// ── タイル設定インターフェース ─────────────────────────────────────────────
export interface TileConfig {
  id: number;
  name: string;
  symbol: string;
  color: string;
  walkable: boolean;
  enemySpawn: boolean;
}

// ── タイル設定定義 ────────────────────────────────────────────────────────
export const TILE_CONFIG: Record<TileType, TileConfig> = {
  [TileType.GRASS]: {
    id: 0,
    name: "草原",
    symbol: "",
    color: "#4a7c59",
    walkable: true,
    enemySpawn: true,
  },
  [TileType.WATER]: {
    id: 1,
    name: "水辺",
    symbol: "≋",
    color: "#3a7bd5",
    walkable: false,
    enemySpawn: false,
  },
  [TileType.FOREST]: {
    id: 2,
    name: "森",
    symbol: "🌲",
    color: "#2d5a1b",
    walkable: false,
    enemySpawn: false,
  },
  [TileType.ROCK]: {
    id: 3,
    name: "岩場",
    symbol: "⛰",
    color: "#7a6a5a",
    walkable: false,
    enemySpawn: false,
  },
  [TileType.ROAD]: {
    id: 4,
    name: "道",
    symbol: "",
    color: "#c8a96a",
    walkable: true,
    enemySpawn: false,
  },
  [TileType.TOWN]: {
    id: 5,
    name: "町",
    symbol: "🏘",
    color: "#e8d5a3",
    walkable: true,
    enemySpawn: false,
  },
  [TileType.DUNGEON]: {
    id: 6,
    name: "ダンジョン",
    symbol: "⚔",
    color: "#4a3a6a",
    walkable: true,
    enemySpawn: false,
  },
  [TileType.DESERT]: {
    id: 7,
    name: "砂漠",
    symbol: "🏜",
    color: "#c8960a",
    walkable: true,
    enemySpawn: true,
  },
  [TileType.SNOW]: {
    id: 8,
    name: "雪原",
    symbol: "❄",
    color: "#c8e0f0",
    walkable: true,
    enemySpawn: true,
  },
  [TileType.PORTAL]: {
    id: 9,
    name: "出口",
    symbol: "🚪",
    color: "#7c3aed",
    walkable: true,
    enemySpawn: false,
  },
};

// ── 互換性のための定義（既存コード用）──────────────────────────────────────
export const MAP_TILE_COLORS: Record<number, string> = {
  0: "#4a7c59",
  1: "#3a7bd5",
  2: "#2d5a1b",
  3: "#7a6a5a",
  4: "#c8a96a",
  5: "#e8d5a3",
  6: "#4a3a6a",
  7: "#c8960a",
  8: "#c8e0f0",
  9: "#7c3aed",
};

export const MAP_TILE_SYMBOLS: Record<number, string> = {
  0: "",
  1: "≋",
  2: "🌲",
  3: "⛰",
  4: "",
  5: "🏘",
  6: "⚔",
  7: "🏜",
  8: "❄",
  9: "🚪",
};

export const MAP_TILE_NAMES: Record<number, string> = {
  0: "草原",
  1: "水辺",
  2: "森",
  3: "岩場",
  4: "道",
  5: "🏘 町",
  6: "⚔ ダンジョン",
  7: "🏜 砂漠",
  8: "❄ 雪原",
  9: "🚪 出口",
};

export const WALKABLE_TILES = new Set([
  TileType.GRASS,
  TileType.ROAD,
  TileType.TOWN,
  TileType.DUNGEON,
  TileType.DESERT,
  TileType.SNOW,
  TileType.PORTAL,
]);

// ── マップID定数 ───────────────────────────────────────────────────────────
export const MAP_IDS = {
  ELDARIA_PLAINS: "map-001",
  CALDA_DESERT: "map-002",
  FROSTHEIM: "map-003",
  MILWOOD_FOREST: "map-004",
  VOLCANOS: "map-005",
  ABYSS: "map-006",
  DEMON_CASTLE: "map-007",
  UNDERWATER: "map-008",
  SKY_TEMPLE: "map-009",
  ICE_TEMPLE: "map-010",
  POISON_SWAMP: "map-011",
  ANCIENT_RUINS: "map-012",
  DRAGON_LAIR: "map-013",
  LIGHT_SANCTUARY: "map-014",
  DARK_TEMPLE: "map-015",
  CELESTIAL_SANCTUARY: "map-016",
  DEEP_SEA: "map-017",
  ICE_CAVERN: "map-018",
} as const;

// ── 型定義 ────────────────────────────────────────────────────────────────
export interface MapTransition {
  fromRow: number;
  fromCol: number;
  toMapId: string;
  toRow: number;
  toCol: number;
  label: string;
  /** 世界地図・地域地図に接続線として表示するか（省略時 true） */
  showOnWorldMap?: boolean;
}

/** mapTransitions.json から読み込んだ全マップのトランジションデータ */
export const MAP_TRANSITIONS: Record<string, MapTransition[]> =
  mapTransitionsJson as Record<string, MapTransition[]>;

export interface MapMasterData {
  id: string;
  name: string;
  description: string;
  emoji: string;
  enemySpawnTiles: TileType[];
  /** このマップに出現する敵の ID リスト */
  enemyIds: string[];
  /** 出現する敵の基準レベル */
  baseLevel: number;
  /** 基準レベルに加算するランダム幅 (0〜levelVariance) */
  levelVariance: number;
  transitions: MapTransition[];
  defaultPos: { row: number; col: number };
  /** このマップにある町の ID リスト */
  townIds?: string[];
  /** このマップにある町のタイル位置マッピング */
  townTileMappings?: TownTileMapping[];
  tileMap: number[][];
}

/** 町タイル位置と町IDのマッピング */
export interface TownTileMapping {
  row: number;
  col: number;
  townId: string;
}

/** mapMasterAdditions.json で追加されたマップの型（tileMap を JSON 配列として保持） */
export type MapMasterAddition = Omit<MapMasterData, 'transitions'>;

/** JSON から読み込んだ追加マップ一覧 */
export const MAP_ADDITIONS: MapMasterAddition[] =
  mapMasterAdditionsJson as MapMasterAddition[];

// ══════════════════════════════════════════════════════════════════════════
// マップマスタ定義
// ══════════════════════════════════════════════════════════════════════════
const STATIC_MAP_MASTER: MapMasterData[] = [
  {
    id: "map-001",
    name: "エルダリア平原",
    description: "主都アルバスの里を擁する冒険者の起点。草原・森・砂漠の縁が広がる初心者向けエリア。",
    emoji: "🌿",
    enemySpawnTiles: [TileType.GRASS, TileType.DESERT, TileType.SNOW],
    enemyIds: [
      "e-001", // スライム
      "e-020", // ヘドロスライム
      "e-002", // 魚類
      "e-022", // ピラニア
      "e-003", // イノシシ
      "e-004", // ゴブリン
      "e-005", // オーク
      "e-013", // ウサギ
      "e-014", // スズメ
      "e-016", // しばいぬ
      "e-017", // ねこ
      "e-025", // オーク戦士
    ],
    baseLevel: 1,
    levelVariance: 4,
    defaultPos: { row: 2, col: 4 },
    townIds: ["town-001", "town-002", "town-003", "town-004"],
    townTileMappings: [
      { row: 3, col: 4, townId: "town-001" }, // アルバスの里
      { row: 10, col: 5, townId: "town-002" }, // 宿場ミドウェイ
      { row: 15, col: 4, townId: "town-003" }, // 漁師村ラグナ
      { row: 14, col: 18, townId: "town-004" }, // 砂漠の砦スエズ
    ],
    transitions: MAP_TRANSITIONS["map-001"] ?? [],
    tileMap: MAP1_TILES,
  },
  {
    id: "map-002",
    name: "カルダ砂漠",
    description: "伝説の戦士カルダの名を冠した灼熱の砂漠。カルダシティとカルダ旧市街が砂の中に建つ。",
    emoji: "🏜",
    enemySpawnTiles: [TileType.DESERT, TileType.GRASS],
    townIds: ["town-005", "town-002", "town-004", "town-009"],
    townTileMappings: [
      { row: 6, col: 10, townId: "town-005" }, // カルダシティ
      { row: 10, col: 5, townId: "town-002" }, // 宿場ミドウェイ
      { row: 14, col: 1, townId: "town-004" }, // カルダ旧市街
    ],
    enemyIds: [
      "e-004", // ゴブリン
      "e-023", // ゴブリン族長
      "e-024", // ゴブリンシャーマン
      "e-005", // オーク
      "e-025", // オーク戦士
      "e-007", // リザードマン
      "e-008", // ハイオーク
      "e-019", // カメ
      "e-035", // 古代ガメ
      "e-018", // きつね
      "e-072", // 女シーフ
    ],
    baseLevel: 5,
    levelVariance: 5,
    defaultPos: { row: 1, col: 1 },
    transitions: MAP_TRANSITIONS["map-002"] ?? [],
    tileMap: MAP2_TILES,
  },
  {
    id: "map-003",
    name: "フロストハイム雪原",
    description: "北方語で「霜の故郷」を意味する永久凍土。",
    emoji: "❄",
    enemySpawnTiles: [TileType.GRASS, TileType.DESERT, TileType.SNOW],
    townIds: ["town-007", "town-008", "town-012"],
    townTileMappings: [
      { row: 4, col: 5, townId: "town-007" }, // フロスト村
      { row: 14, col: 15, townId: "town-008" }, // ウィンターホルム
      { row: 0, col: 1, townId: "town-012" }, // セレスティア聖域
    ],
    enemyIds: [
      "e-001", // スライム
      "e-006", // スケルトン
      "e-013", // ウサギ
      "e-031", // スノーラビット
      "e-010", // トラ
      "e-029", // チーター
      "e-011", // 魚人族
      "e-012", // 水竜
    ],
    baseLevel: 5,
    levelVariance: 4,
    defaultPos: { row: 4, col: 5 },
    transitions: MAP_TRANSITIONS["map-003"] ?? [],
    tileMap: MAP3_TILES,
  },
  {
    id: "map-004",
    name: "ミルウッドの深森",
    description: "千年の古木が茂る神秘の森。精霊が宿ると言われる。",
    emoji: "🌲",
    enemySpawnTiles: [TileType.GRASS, TileType.DESERT, TileType.SNOW],
    townIds: ["town-006", "town-013"],
    townTileMappings: [
      { row: 3, col: 2, townId: "town-006" }, // 隠し里エルーン
      { row: 17, col: 17, townId: "town-013" }, // 遺跡ダンジョン入口
    ],
    enemyIds: [
      "e-003", // イノシシ
      "e-013", // ウサギ
      "e-014", // スズメ
      "e-015", // タカ
      "e-016", // しばいぬ
      "e-017", // ねこ
      "e-018", // きつね
      "e-032", // 暗黒の大鷹
      "e-033", // 魔法ネコ
      "e-034", // 九尾の狐
      "e-004", // ゴブリン
      "e-072", // 女シーフ
      "e-075", // 巨大イモムシ
    ],
    baseLevel: 3,
    levelVariance: 5,
    defaultPos: { row: 10, col: 18 },
    transitions: MAP_TRANSITIONS["map-004"] ?? [],
    tileMap: MAP4_TILES,
  },
  {
    id: "map-005",
    name: "ヴォルカノス火山帯",
    description: "活火山ヴォルカノスを中心とした危険な溶岩地帯。",
    emoji: "🌋",
    enemySpawnTiles: [TileType.DESERT, TileType.GRASS],
    townIds: ["town-008", "town-014"],
    townTileMappings: [
      { row: 10, col: 14, townId: "town-008" }, // 灰の砦アシュフォード
      { row: 18, col: 0, townId: "town-014" }, // マグマの洞窟
    ],
    enemyIds: [
      "e-007", // リザードマン
      "e-028", // リザードシャーマン
      "e-009", // ゴーレム
      "e-008", // ハイオーク
      "e-025", // オーク戦士
      "e-018", // きつね
      "e-034", // 九尾の狐
      "e-010", // トラ
      "e-030", // ライオン
      "e-068", // サラマンダー
    ],
    baseLevel: 8,
    levelVariance: 6,
    defaultPos: { row: 1, col: 10 },
    transitions: MAP_TRANSITIONS["map-005"] ?? [],
    tileMap: MAP5_TILES,
  },
  {
    id: "map-006",
    name: "セレスティア聖域",
    description: "天空に最も近い聖なる高地。光の都エンシェントを抜けた先に、天空神殿が聳え立つ。",
    emoji: "✨",
    enemySpawnTiles: [TileType.GRASS, TileType.SNOW],
    enemyIds: [
      "e-014", // スズメ
      "e-015", // タカ
      "e-032", // 暗黒の大鷹
      "e-021", // メタルスライム
      "e-033", // 魔法ネコ
      "e-012", // 水竜
      "e-009", // ゴーレム
      "e-035", // 古代ガメ
      "e-034", // 九尾の狐
      "e-027", // デスナイト
      "e-073", // 女白魔術師
    ],
    baseLevel: 12,
    levelVariance: 7,
    defaultPos: { row: 18, col: 10 },
    transitions: MAP_TRANSITIONS["map-006"] ?? [],
    tileMap: MAP6_TILES,
  },
  {
    id: "map-007",
    name: "アビスの奈落",
    description: "底の見えない地下迷宮。闇の魔物が巣食う禁断の深淵。前線基地を拠点に勇者たちが挑む。",
    emoji: "🕳",
    enemySpawnTiles: [TileType.DUNGEON],
    enemyIds: [
      "e-006", // スケルトン
      "e-026", // ボーンアーチャー
      "e-027", // デスナイト
      "e-009", // ゴーレム
      "e-035", // 古代ガメ
      "e-020", // ヘドロスライム
      "e-024", // ゴブリンシャーマン
      "e-033", // 魔法ネコ
      "e-032", // 暗黒の大鷹
      "e-034", // 九尾の狐
      "e-011", // 魚人族
      "e-012", // 水竜
      "e-069", // リリス
      "e-074", // 女黒魔術師
    ],
    baseLevel: 15,
    levelVariance: 10,
    defaultPos: { row: 0, col: 1 },
    transitions: MAP_TRANSITIONS["map-007"] ?? [],
    tileMap: MAP7_TILES,
  },

  // ── 新エリア ──────────────────────────────────────────────────────────
  {
    id: "map-008",
    name: "海底神殿",
    description: "エルダリア平原の西岸から潜った先にある古代の水中遺跡。深海の宝珠が眠ると伝わる。",
    emoji: "🌊",
    enemySpawnTiles: [TileType.DUNGEON, TileType.GRASS],
    townIds: ["town-011"],
    townTileMappings: [
      { row: 5, col: 5, townId: "town-011" }, // 海底の砦
    ],
    enemyIds: [
      "e-001", // スライム
      "e-036", // ジェリースライム
      "e-037", // 氷魚
      "e-038", // 深海ウミガメ
      "e-039", // 海竜の子
      "e-011", // 魚人族
      "e-022", // ピラニア
      "e-012", // 水竜
      "e-067", // ウンディーネ
    ],
    baseLevel: 10,
    levelVariance: 5,
    defaultPos: { row: 0, col: 1 },
    transitions: MAP_TRANSITIONS["map-008"] ?? [],
    tileMap: MAP8_TILES,
  },
  {
    id: "map-009",
    name: "天空聖殿",
    description: "セレスティア聖域の先にある雲上の神殿。天使と光の守護者が棲まう聖なる場所。",
    emoji: "🌟",
    enemySpawnTiles: [TileType.GRASS, TileType.SNOW],
    townIds: ["town-018"],
    townTileMappings: [
      { row: 6, col: 3, townId: "town-018" }, // 天空の城塞
    ],
    enemyIds: [
      "e-014", // スズメ
      "e-015", // タカ
      "e-048", // 幻影ネコ
      "e-049", // 聖域の大鷹
      "e-032", // 暗黒の大鷹
      "e-021", // メタルスライム
      "e-034", // 九尾の狐
      "e-035", // 古代ガメ
      "e-073", // 女白魔術師
    ],
    baseLevel: 16,
    levelVariance: 6,
    defaultPos: { row: 19, col: 10 },
    transitions: MAP_TRANSITIONS["map-009"] ?? [],
    tileMap: MAP9_TILES,
  },
  {
    id: "map-010",
    name: "魔王城",
    description: "アビスの奈落の最深部に佇む魔王の居城。最強の魔物たちが守護する究極の試練の場。",
    emoji: "👿",
    enemySpawnTiles: [TileType.DUNGEON],
    townIds: ["town-019"],
    townTileMappings: [
      { row: 11, col: 8, townId: "town-019" }, // 奈落の前哨基地
    ],
    enemyIds: [
      "e-027", // デスナイト
      "e-044", // 古代スケルトン
      "e-050", // 黄金ゴーレム
      "e-051", // 魔王兵
      "e-052", // 魔王の使者
      "e-009", // ゴーレム
      "e-032", // 暗黒の大鷹
      "e-034", // 九尾の狐
      "e-069", // リリス
      "e-070", // ハイリリス
      "e-074", // 女黒魔術師
    ],
    baseLevel: 20,
    levelVariance: 8,
    defaultPos: { row: 0, col: 18 },
    transitions: MAP_TRANSITIONS["map-010"] ?? [],
    tileMap: MAP10_TILES,
  },
  {
    id: "map-011",
    name: "毒の沼地",
    description: "ミルウッドの深森を抜けた先に広がる毒に満ちた暗い湿地帯。毒の魔物が闊歩する。",
    emoji: "☠️",
    enemySpawnTiles: [TileType.GRASS, TileType.DUNGEON],
    townIds: ["town-012"],
    townTileMappings: [
      { row: 5, col: 7, townId: "town-012" }, // 沼地の番小屋
    ],
    enemyIds: [
      "e-040", // 毒カメ
      "e-041", // ダークゴブリン
      "e-042", // ヌシガエル
      "e-036", // ジェリースライム
      "e-020", // ヘドロスライム
      "e-004", // ゴブリン
      "e-024", // ゴブリンシャーマン
      "e-006", // スケルトン
      "e-075", // 巨大イモムシ
    ],
    baseLevel: 6,
    levelVariance: 4,
    defaultPos: { row: 0, col: 11 },
    transitions: MAP_TRANSITIONS["map-011"] ?? [],
    tileMap: MAP11_TILES,
  },
  {
    id: "map-012",
    name: "氷の魔窟",
    description: "フロストハイム雪原の奥に口を開く巨大な氷窟。古代スケルトンや氷のゴーレムが待ち受ける。",
    emoji: "🧊",
    enemySpawnTiles: [TileType.DUNGEON, TileType.SNOW],
    townIds: ["town-015"],
    townTileMappings: [
      { row: 1, col: 10, townId: "town-015" }, // 氷窟の灯台
    ],
    enemyIds: [
      "e-031", // スノーラビット
      "e-037", // 氷魚
      "e-043", // アイスゴーレム
      "e-044", // 古代スケルトン
      "e-006", // スケルトン
      "e-026", // ボーンアーチャー
      "e-009", // ゴーレム
      "e-012", // 水竜
    ],
    baseLevel: 10,
    levelVariance: 5,
    defaultPos: { row: 1, col: 11 },
    transitions: MAP_TRANSITIONS["map-012"] ?? [],
    tileMap: MAP12_TILES,
  },
  {
    id: "map-013",
    name: "竜の棲み処",
    description: "ヴォルカノス火山帯の深部にある古竜たちの聖域。猛烈な熱気と炎に満ちた試練の地。",
    emoji: "🐲",
    enemySpawnTiles: [TileType.DESERT, TileType.GRASS, TileType.DUNGEON],
    townIds: ["town-016", "town-017"],
    townTileMappings: [
      { row: 5,  col: 10, townId: "town-016" }, // 竜の里
      { row: 16, col: 9,  townId: "town-017" }, // 竜の巣の前哨基地
    ],
    enemyIds: [
      "e-045", // バジリスク
      "e-046", // 竜虎
      "e-047", // 炎鷹
      "e-007", // リザードマン
      "e-028", // リザードシャーマン
      "e-034", // 九尾の狐
      "e-010", // トラ
      "e-030", // ライオン
      "e-068", // サラマンダー
    ],
    baseLevel: 14,
    levelVariance: 6,
    defaultPos: { row: 0, col: 11 },
    transitions: MAP_TRANSITIONS["map-013"] ?? [],
    tileMap: MAP13_TILES,
  },

  // ── 新エリア (map-014〜018) ────────────────────────────────────────────
  {
    id: "map-014",
    name: "深海の底",
    description: "海底神殿の最深部に広がる未知の深海世界。深海の魔魚や海底の亡霊が棲む神秘の場所。",
    emoji: "🌊",
    enemySpawnTiles: [TileType.DUNGEON, TileType.GRASS],
    townIds: ["town-020"],
    townTileMappings: [
      { row: 5, col: 5, townId: "town-020" }, // 深海基地
    ],
    enemyIds: [
      "e-053", // 深海の魔魚
      "e-054", // 深海蟹
      "e-055", // 海底の亡霊
      "e-039", // 海竜の子
      "e-038", // 深海ウミガメ
      "e-011", // 魚人族
      "e-012", // 水竜
      "e-037", // 氷魚
      "e-067", // ウンディーネ
    ],
    baseLevel: 15,
    levelVariance: 8,
    defaultPos: { row: 0, col: 9 },
    transitions: MAP_TRANSITIONS["map-014"] ?? [],
    tileMap: MAP14_TILES,
  },
  {
    id: "map-015",
    name: "光の聖域",
    description: "天空聖殿の更に高みにある純粋な光に満ちた神域。光の天使と聖光の騎士が守護する。",
    emoji: "💛",
    enemySpawnTiles: [TileType.GRASS, TileType.SNOW],
    townIds: ["town-021"],
    townTileMappings: [
      { row: 5, col: 6, townId: "town-021" }, // 光の聖堂
    ],
    enemyIds: [
      "e-056", // 光の天使
      "e-057", // 聖光の騎士
      "e-058", // 光の守護者
      "e-049", // 聖域の大鷹
      "e-048", // 幻影ネコ
      "e-034", // 九尾の狐
      "e-021", // メタルスライム
      "e-035", // 古代ガメ
      "e-073", // 女白魔術師
    ],
    baseLevel: 22,
    levelVariance: 8,
    defaultPos: { row: 19, col: 9 },
    transitions: MAP_TRANSITIONS["map-015"] ?? [],
    tileMap: MAP15_TILES,
  },
  {
    id: "map-016",
    name: "闇の神殿",
    description: "魔王城の深部に潜む究極の暗黒の神殿。闇の大魔神と奈落の怪物が君臨する最終試練の地。",
    emoji: "🖤",
    enemySpawnTiles: [TileType.DUNGEON],
    townIds: ["town-022"],
    townTileMappings: [
      { row: 10, col: 10, townId: "town-022" }, // 闇の前哨砦
    ],
    enemyIds: [
      "e-059", // 闇の大魔神
      "e-060", // 奈落の怪物
      "e-052", // 魔王の使者
      "e-051", // 魔王兵
      "e-027", // デスナイト
      "e-044", // 古代スケルトン
      "e-050", // 黄金ゴーレム
      "e-032", // 暗黒の大鷹
      "e-070", // ハイリリス
      "e-071", // リリスクイーン
      "e-074", // 女黒魔術師
    ],
    baseLevel: 28,
    levelVariance: 8,
    defaultPos: { row: 0, col: 9 },
    transitions: MAP_TRANSITIONS["map-016"] ?? [],
    tileMap: MAP16_TILES,
  },
  {
    id: "map-017",
    name: "古代の神殿",
    description: "毒の沼地の奥深くに眠る太古の神殿遺跡。古代の番人と石像の守護者が遺産を守る。",
    emoji: "🏛️",
    enemySpawnTiles: [TileType.GRASS, TileType.DUNGEON],
    townIds: ["town-023"],
    townTileMappings: [
      { row: 11, col: 11, townId: "town-023" }, // 古代神殿の門前
    ],
    enemyIds: [
      "e-061", // 古代の番人
      "e-062", // 石像の守護者
      "e-063", // 遺跡の魔導師
      "e-040", // 毒カメ
      "e-035", // 古代ガメ
      "e-009", // ゴーレム
      "e-024", // ゴブリンシャーマン
      "e-041", // ダークゴブリン
    ],
    baseLevel: 9,
    levelVariance: 7,
    defaultPos: { row: 0, col: 9 },
    transitions: MAP_TRANSITIONS["map-017"] ?? [],
    tileMap: MAP17_TILES,
  },
  {
    id: "map-018",
    name: "氷雪神殿",
    description: "氷の魔窟の奥に広がる神聖な氷の神殿。雪の女王と白竜が支配する永遠の氷河の地。",
    emoji: "❄️",
    enemySpawnTiles: [TileType.SNOW, TileType.DUNGEON],
    townIds: ["town-024"],
    townTileMappings: [
      { row: 5, col: 10, townId: "town-024" }, // 氷神殿の入口
    ],
    enemyIds: [
      "e-064", // 氷の精霊
      "e-065", // 雪の女王
      "e-066", // 白竜
      "e-043", // アイスゴーレム
      "e-044", // 古代スケルトン
      "e-031", // スノーラビット
      "e-012", // 水竜
      "e-037", // 氷魚
    ],
    baseLevel: 16,
    levelVariance: 8,
    defaultPos: { row: 19, col: 9 },
    transitions: MAP_TRANSITIONS["map-018"] ?? [],
    tileMap: MAP18_TILES,
  },
];

/** 静的マップ + additions をマージした全マップリスト */
export const MAP_MASTER: MapMasterData[] = [
  ...STATIC_MAP_MASTER,
  ...MAP_ADDITIONS.map(m => ({
    ...m,
    enemySpawnTiles: m.enemySpawnTiles as TileType[],
    transitions: MAP_TRANSITIONS[m.id] ?? [],
  })),
];

export const MAP_MASTER_MAP: Record<string, MapMasterData> = Object.fromEntries(
  MAP_MASTER.map((m) => [m.id, m])
);

export const DEFAULT_MAP_ID = "map-001";
