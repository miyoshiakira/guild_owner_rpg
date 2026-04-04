import type { EnemyMaster } from "../../types/masters";

/**
 * 敵マスタ — レベルはすべて 1 基準。
 * 実際のレベル・ステータスはフィールドスポーン時に
 * 原点(0,0)からの距離に基づいてスケーリングされる。
 */
export const ENEMY_MASTER: EnemyMaster[] = [
  {
    id: "e-001",
    name: "スライム",
    type: "水",
    level: 1,
    hp: 14, maxHp: 14, mp: 2, maxMp: 2,
    atk: 4, def: 5, spd: 4,
    sprite: "スライム.png",
    reward: { exp: 10, gold: 8 },
    catchRate: 0.3,
    personality: "のんき",
    skills: ["たいあたり", "みずしぶき"],
    drops: [
      { materialId: "mat-001", rate: 0.8, minQty: 1, maxQty: 3 },
      { materialId: "mat-002", rate: 0.2, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: "e-002",
    name: "魚類",
    type: "水",
    level: 1,
    hp: 10, maxHp: 10, mp: 0, maxMp: 0,
    atk: 4, def: 2, spd: 8,
    sprite: "魚類.png",
    reward: { exp: 8, gold: 5 },
    catchRate: 0.25,
    personality: "のんき",
    skills: ["はねまわる"],
    drops: [
      { materialId: "mat-001", rate: 0.5, minQty: 1, maxQty: 2 },
      { materialId: "mat-012", rate: 0.7, minQty: 1, maxQty: 2 }, // 鱗
    ],
  },
  {
    id: "e-003",
    name: "イノシシ",
    type: "地",
    level: 1,
    hp: 16, maxHp: 16, mp: 0, maxMp: 0,
    atk: 7, def: 4, spd: 9,
    sprite: "イノシシ.png",
    reward: { exp: 14, gold: 10 },
    catchRate: 0.2,
    personality: "いじっぱり",
    skills: ["つっこみ", "たいあたり"],
    drops: [
      { materialId: "mat-003", rate: 0.6, minQty: 1, maxQty: 2 },
      { materialId: "mat-017", rate: 0.5, minQty: 1, maxQty: 2 }, // 獣の爪
    ],
  },
  {
    id: "e-004",
    name: "ゴブリン",
    type: "地",
    level: 1,
    hp: 15, maxHp: 15, mp: 0, maxMp: 0,
    atk: 6, def: 4, spd: 9,
    sprite: "ゴブリン.png",
    reward: { exp: 16, gold: 12 },
    catchRate: 0.2,
    personality: "きまぐれ",
    skills: ["ひっかく", "どろなげ"],
    drops: [
      { materialId: "mat-007", rate: 0.6, minQty: 1, maxQty: 2 },
      { materialId: "mat-003", rate: 0.3, minQty: 1, maxQty: 1 },
      { materialId: "mat-015", rate: 0.4, minQty: 1, maxQty: 1 }, // 毒の牙
    ],
  },
  {
    id: "e-005",
    name: "オーク",
    type: "地",
    level: 1,
    hp: 20, maxHp: 20, mp: 0, maxMp: 0,
    atk: 8, def: 6, spd: 4,
    sprite: "オーク.png",
    reward: { exp: 20, gold: 15 },
    catchRate: 0.15,
    personality: "いじっぱり",
    skills: ["なぐりつける", "おたけび"],
    drops: [
      { materialId: "mat-003", rate: 0.7, minQty: 1, maxQty: 2 },
      { materialId: "mat-004", rate: 0.3, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: "e-006",
    name: "スケルトン",
    type: "闇",
    level: 1,
    hp: 16, maxHp: 16, mp: 5, maxMp: 5,
    atk: 7, def: 4, spd: 6,
    sprite: "スケルトン.png",
    reward: { exp: 22, gold: 18 },
    catchRate: 0.12,
    personality: "ふつう",
    skills: ["ボーンクラッシュ", "カースボーン"],
    drops: [
      { materialId: "mat-008", rate: 0.7, minQty: 1, maxQty: 3 },
      { materialId: "mat-004", rate: 0.3, minQty: 1, maxQty: 2 },
    ],
  },
  {
    id: "e-007",
    name: "リザードマン",
    type: "炎",
    level: 1,
    hp: 18, maxHp: 18, mp: 8, maxMp: 8,
    atk: 8, def: 4, spd: 7,
    sprite: "リザードマン.png",
    reward: { exp: 25, gold: 20 },
    catchRate: 0.12,
    personality: "やんちゃ",
    skills: ["ファイアブレス", "しっぽ攻撃"],
    drops: [
      { materialId: "mat-009", rate: 0.5, minQty: 1, maxQty: 2 },
      { materialId: "mat-005", rate: 0.3, minQty: 1, maxQty: 2 },
      { materialId: "mat-016", rate: 0.6, minQty: 1, maxQty: 2 }, // 炎の鱗
      { materialId: "mat-012", rate: 0.5, minQty: 1, maxQty: 1 }, // 鱗
    ],
  },
  {
    id: "e-008",
    name: "ハイオーク",
    type: "地",
    level: 1,
    hp: 22, maxHp: 22, mp: 0, maxMp: 0,
    atk: 10, def: 7, spd: 4,
    sprite: "ハイオーク.png",
    reward: { exp: 28, gold: 22 },
    catchRate: 0.1,
    personality: "いじっぱり",
    skills: ["おおなぎ", "いかりのほえ"],
    drops: [
      { materialId: "mat-003", rate: 0.6, minQty: 2, maxQty: 3 },
      { materialId: "mat-007", rate: 0.4, minQty: 1, maxQty: 2 },
      { materialId: "mat-013", rate: 0.5, minQty: 1, maxQty: 2 }, // 鉄の欠片
    ],
  },
  {
    id: "e-009",
    name: "ゴーレム",
    type: "地",
    level: 1,
    hp: 28, maxHp: 28, mp: 0, maxMp: 0,
    atk: 6, def: 16, spd: 2,
    sprite: "ゴーレム.png",
    reward: { exp: 30, gold: 25 },
    catchRate: 0.08,
    personality: "のんき",
    skills: ["岩石投げ", "ストーンウォール"],
    drops: [
      { materialId: "mat-004", rate: 0.7, minQty: 2, maxQty: 4 },
      { materialId: "mat-011", rate: 0.2, minQty: 1, maxQty: 1 },
      { materialId: "mat-013", rate: 0.8, minQty: 2, maxQty: 4 }, // 鉄の欠片
    ],
  },
  {
    id: "e-010",
    name: "トラ",
    type: "地",
    level: 1,
    hp: 20, maxHp: 20, mp: 0, maxMp: 0,
    atk: 9, def: 4, spd: 11,
    sprite: "トラ.png",
    reward: { exp: 26, gold: 20 },
    catchRate: 0.08,
    personality: "いじっぱり",
    skills: ["きばをむく", "爪撃ち"],
    drops: [
      { materialId: "mat-003", rate: 0.7, minQty: 1, maxQty: 2 },
      { materialId: "mat-010", rate: 0.3, minQty: 1, maxQty: 2 },
      { materialId: "mat-017", rate: 0.6, minQty: 1, maxQty: 2 }, // 獣の爪
    ],
  },
  {
    id: "e-011",
    name: "魚人族",
    type: "水",
    level: 1,
    hp: 18, maxHp: 18, mp: 8, maxMp: 8,
    atk: 7, def: 5, spd: 7,
    sprite: "魚人族.png",
    reward: { exp: 22, gold: 18 },
    catchRate: 0.12,
    personality: "ふつう",
    skills: ["みずしぶき", "もりなげ"],
    drops: [
      { materialId: "mat-010", rate: 0.5, minQty: 1, maxQty: 2 },
      { materialId: "mat-001", rate: 0.4, minQty: 1, maxQty: 2 },
      { materialId: "mat-012", rate: 0.6, minQty: 1, maxQty: 2 }, // 鱗
      { materialId: "mat-015", rate: 0.3, minQty: 1, maxQty: 1 }, // 毒の牙
    ],
  },
  {
    id: "e-012",
    name: "水竜",
    type: "水",
    level: 1,
    hp: 30, maxHp: 30, mp: 15, maxMp: 15,
    atk: 9, def: 8, spd: 6,
    sprite: "水竜.png",
    reward: { exp: 40, gold: 30 },
    catchRate: 0.04,
    personality: "ふつう",
    skills: ["アイスブレス", "しっぽなぎ", "水波"],
    drops: [
      { materialId: "mat-010", rate: 0.7, minQty: 2, maxQty: 4 },
      { materialId: "mat-006", rate: 0.4, minQty: 1, maxQty: 2 },
      { materialId: "mat-011", rate: 0.3, minQty: 1, maxQty: 1 },
      { materialId: "mat-012", rate: 0.5, minQty: 2, maxQty: 3 }, // 鱗
      { materialId: "mat-014", rate: 0.25, minQty: 1, maxQty: 1 }, // 竜の牙（希少）
    ],
  },

  // ── 獣系モンスター ────────────────────────────────────────────────────
  {
    id: "e-013",
    name: "ウサギ",
    type: "地",
    level: 1,
    hp: 8, maxHp: 8, mp: 0, maxMp: 0,
    atk: 3, def: 1, spd: 12,
    sprite: "ウサギ.png",
    reward: { exp: 7, gold: 5 },
    catchRate: 0.35,
    personality: "おくびょう",
    skills: ["跳び蹴り"],
    drops: [
      { materialId: "mat-018", rate: 0.8, minQty: 1, maxQty: 2 }, // 柔らかい毛皮
    ],
  },
  {
    id: "e-014",
    name: "スズメ",
    type: "光",
    level: 1,
    hp: 6, maxHp: 6, mp: 0, maxMp: 0,
    atk: 3, def: 1, spd: 14,
    sprite: "スズメ.png",
    reward: { exp: 6, gold: 4 },
    catchRate: 0.30,
    personality: "おくびょう",
    skills: ["くちばし攻撃"],
    drops: [
      { materialId: "mat-019", rate: 0.8, minQty: 1, maxQty: 3 }, // 羽根
    ],
  },
  {
    id: "e-015",
    name: "タカ",
    type: "光",
    level: 1,
    hp: 14, maxHp: 14, mp: 0, maxMp: 0,
    atk: 7, def: 2, spd: 11,
    sprite: "タカ.png",
    reward: { exp: 18, gold: 13 },
    catchRate: 0.18,
    personality: "いじっぱり",
    skills: ["急降下", "かぎ爪"],
    drops: [
      { materialId: "mat-019", rate: 0.7, minQty: 1, maxQty: 2 }, // 羽根
      { materialId: "mat-017", rate: 0.3, minQty: 1, maxQty: 1 }, // 獣の爪
    ],
  },
  {
    id: "e-016",
    name: "しばいぬ",
    type: "地",
    level: 1,
    hp: 16, maxHp: 16, mp: 0, maxMp: 0,
    atk: 6, def: 3, spd: 8,
    sprite: "しばいぬ.png",
    reward: { exp: 16, gold: 12 },
    catchRate: 0.25,
    personality: "なまいき",
    skills: ["噛みつき", "威嚇"],
    drops: [
      { materialId: "mat-017", rate: 0.6, minQty: 1, maxQty: 2 }, // 獣の爪
      { materialId: "mat-018", rate: 0.5, minQty: 1, maxQty: 1 }, // 柔らかい毛皮
      { materialId: "mat-003", rate: 0.3, minQty: 1, maxQty: 1 }, // 獣の毛皮
    ],
  },
  {
    id: "e-017",
    name: "ねこ",
    type: "地",
    level: 1,
    hp: 12, maxHp: 12, mp: 4, maxMp: 4,
    atk: 6, def: 2, spd: 11,
    sprite: "ねこ.png",
    reward: { exp: 14, gold: 10 },
    catchRate: 0.22,
    personality: "きまぐれ",
    skills: ["ひっかく", "ネコパンチ"],
    drops: [
      { materialId: "mat-017", rate: 0.6, minQty: 1, maxQty: 2 }, // 獣の爪
      { materialId: "mat-018", rate: 0.5, minQty: 1, maxQty: 1 }, // 柔らかい毛皮
    ],
  },
  {
    id: "e-018",
    name: "きつね",
    type: "炎",
    level: 1,
    hp: 14, maxHp: 14, mp: 6, maxMp: 6,
    atk: 6, def: 3, spd: 10,
    sprite: "きつね.png",
    reward: { exp: 18, gold: 14 },
    catchRate: 0.18,
    personality: "ずる賢い",
    skills: ["かみつき", "狐火"],
    drops: [
      { materialId: "mat-017", rate: 0.5, minQty: 1, maxQty: 2 }, // 獣の爪
      { materialId: "mat-018", rate: 0.4, minQty: 1, maxQty: 1 }, // 柔らかい毛皮
      { materialId: "mat-003", rate: 0.3, minQty: 1, maxQty: 1 }, // 獣の毛皮
    ],
  },
  {
    id: "e-019",
    name: "カメ",
    type: "地",
    level: 1,
    hp: 22, maxHp: 22, mp: 0, maxMp: 0,
    atk: 3, def: 13, spd: 2,
    sprite: "カメ.png",
    reward: { exp: 20, gold: 15 },
    catchRate: 0.20,
    personality: "のんき",
    skills: ["引っ込む", "かみつき"],
    drops: [
      { materialId: "mat-020", rate: 0.75, minQty: 1, maxQty: 2 }, // 甲羅片
      { materialId: "mat-003", rate: 0.3, minQty: 1, maxQty: 1 },  // 獣の毛皮
    ],
  },

  // ── スライム派生 ─────────────────────────────────────────────────────────
  {
    id: "e-020",
    name: "ヘドロスライム",
    type: "闇",
    level: 1,
    hp: 18, maxHp: 18, mp: 4, maxMp: 4,
    atk: 5, def: 8, spd: 2,
    sprite: "スライム.png",
    reward: { exp: 14, gold: 10 },
    catchRate: 0.22,
    personality: "のんき",
    skills: ["どくしぶき", "たいあたり"],
    drops: [
      { materialId: "mat-001", rate: 0.7, minQty: 1, maxQty: 2 },
      { materialId: "mat-002", rate: 0.3, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: "e-021",
    name: "メタルスライム",
    type: "地",
    level: 1,
    hp: 4, maxHp: 4, mp: 0, maxMp: 0,
    atk: 2, def: 30, spd: 15,
    sprite: "スライム.png",
    reward: { exp: 80, gold: 60 },
    catchRate: 0.05,
    personality: "おくびょう",
    skills: ["にげる"],
    drops: [
      { materialId: "mat-006", rate: 0.4, minQty: 1, maxQty: 1 },
      { materialId: "mat-002", rate: 0.6, minQty: 1, maxQty: 2 },
    ],
  },

  // ── 魚類派生 ──────────────────────────────────────────────────────────────
  {
    id: "e-022",
    name: "ピラニア",
    type: "水",
    level: 1,
    hp: 12, maxHp: 12, mp: 0, maxMp: 0,
    atk: 8, def: 2, spd: 10,
    sprite: "魚類.png",
    reward: { exp: 14, gold: 10 },
    catchRate: 0.20,
    personality: "いじっぱり",
    skills: ["かみつき", "はねまわる"],
    drops: [
      { materialId: "mat-012", rate: 0.6, minQty: 1, maxQty: 2 },
      { materialId: "mat-015", rate: 0.4, minQty: 1, maxQty: 1 },
    ],
  },

  // ── ゴブリン派生 ─────────────────────────────────────────────────────────
  {
    id: "e-023",
    name: "ゴブリン族長",
    type: "地",
    level: 1,
    hp: 22, maxHp: 22, mp: 0, maxMp: 0,
    atk: 9, def: 6, spd: 7,
    sprite: "ゴブリン.png",
    reward: { exp: 28, gold: 22 },
    catchRate: 0.10,
    personality: "なまいき",
    skills: ["どなりつける", "ひっかく", "どろなげ"],
    drops: [
      { materialId: "mat-007", rate: 0.7, minQty: 2, maxQty: 3 },
      { materialId: "mat-015", rate: 0.5, minQty: 1, maxQty: 2 },
      { materialId: "mat-003", rate: 0.4, minQty: 1, maxQty: 2 },
    ],
  },
  {
    id: "e-024",
    name: "ゴブリンシャーマン",
    type: "闇",
    level: 1,
    hp: 12, maxHp: 12, mp: 14, maxMp: 14,
    atk: 4, def: 3, spd: 7,
    sprite: "ゴブリン.png",
    reward: { exp: 22, gold: 18 },
    catchRate: 0.14,
    personality: "ずる賢い",
    skills: ["カース", "どろなげ", "毒霧"],
    drops: [
      { materialId: "mat-005", rate: 0.6, minQty: 1, maxQty: 2 },
      { materialId: "mat-007", rate: 0.4, minQty: 1, maxQty: 1 },
    ],
  },

  // ── オーク派生 ───────────────────────────────────────────────────────────
  {
    id: "e-025",
    name: "オーク戦士",
    type: "地",
    level: 1,
    hp: 24, maxHp: 24, mp: 0, maxMp: 0,
    atk: 10, def: 8, spd: 5,
    sprite: "オーク.png",
    reward: { exp: 26, gold: 20 },
    catchRate: 0.12,
    personality: "いじっぱり",
    skills: ["なぎはらい", "おたけび", "なぐりつける"],
    drops: [
      { materialId: "mat-003", rate: 0.7, minQty: 2, maxQty: 3 },
      { materialId: "mat-004", rate: 0.5, minQty: 1, maxQty: 2 },
    ],
  },

  // ── スケルトン派生 ───────────────────────────────────────────────────────
  {
    id: "e-026",
    name: "ボーンアーチャー",
    type: "闇",
    level: 1,
    hp: 14, maxHp: 14, mp: 0, maxMp: 0,
    atk: 9, def: 3, spd: 8,
    sprite: "スケルトン.png",
    reward: { exp: 24, gold: 19 },
    catchRate: 0.12,
    personality: "ふつう",
    skills: ["ボーンアロー", "ダブルショット"],
    drops: [
      { materialId: "mat-008", rate: 0.6, minQty: 1, maxQty: 3 },
      { materialId: "mat-004", rate: 0.4, minQty: 1, maxQty: 2 },
    ],
  },
  {
    id: "e-027",
    name: "デスナイト",
    type: "闇",
    level: 1,
    hp: 26, maxHp: 26, mp: 8, maxMp: 8,
    atk: 10, def: 9, spd: 4,
    sprite: "スケルトン.png",
    reward: { exp: 36, gold: 28 },
    catchRate: 0.08,
    personality: "いじっぱり",
    skills: ["ボーンクラッシュ", "デスブロー", "カースボーン"],
    drops: [
      { materialId: "mat-008", rate: 0.7, minQty: 2, maxQty: 4 },
      { materialId: "mat-011", rate: 0.25, minQty: 1, maxQty: 1 },
    ],
  },

  // ── リザードマン派生 ─────────────────────────────────────────────────────
  {
    id: "e-028",
    name: "リザードシャーマン",
    type: "炎",
    level: 1,
    hp: 16, maxHp: 16, mp: 16, maxMp: 16,
    atk: 6, def: 4, spd: 6,
    sprite: "リザードマン.png",
    reward: { exp: 28, gold: 22 },
    catchRate: 0.10,
    personality: "ずる賢い",
    skills: ["ファイアボール", "炎の壁", "毒の息"],
    drops: [
      { materialId: "mat-005", rate: 0.6, minQty: 1, maxQty: 2 },
      { materialId: "mat-009", rate: 0.5, minQty: 1, maxQty: 2 },
      { materialId: "mat-016", rate: 0.4, minQty: 1, maxQty: 1 },
    ],
  },

  // ── 大型獣派生 ───────────────────────────────────────────────────────────
  {
    id: "e-029",
    name: "チーター",
    type: "地",
    level: 1,
    hp: 15, maxHp: 15, mp: 0, maxMp: 0,
    atk: 8, def: 3, spd: 16,
    sprite: "トラ.png",
    reward: { exp: 22, gold: 16 },
    catchRate: 0.12,
    personality: "いじっぱり",
    skills: ["高速突進", "爪撃ち"],
    drops: [
      { materialId: "mat-017", rate: 0.7, minQty: 1, maxQty: 2 },
      { materialId: "mat-003", rate: 0.4, minQty: 1, maxQty: 1 },
    ],
  },
  {
    id: "e-030",
    name: "ライオン",
    type: "地",
    level: 1,
    hp: 25, maxHp: 25, mp: 0, maxMp: 0,
    atk: 12, def: 6, spd: 8,
    sprite: "トラ.png",
    reward: { exp: 34, gold: 26 },
    catchRate: 0.08,
    personality: "いじっぱり",
    skills: ["獅子咆哮", "きばをむく", "爪撃ち"],
    drops: [
      { materialId: "mat-003", rate: 0.7, minQty: 2, maxQty: 3 },
      { materialId: "mat-017", rate: 0.6, minQty: 1, maxQty: 2 },
    ],
  },

  // ── 雪原ウサギ派生 ───────────────────────────────────────────────────────
  {
    id: "e-031",
    name: "スノーラビット",
    type: "水",
    level: 1,
    hp: 10, maxHp: 10, mp: 4, maxMp: 4,
    atk: 4, def: 2, spd: 13,
    sprite: "ウサギ.png",
    reward: { exp: 10, gold: 8 },
    catchRate: 0.28,
    personality: "おくびょう",
    skills: ["跳び蹴り", "氷の息"],
    drops: [
      { materialId: "mat-018", rate: 0.7, minQty: 1, maxQty: 2 },
      { materialId: "mat-010", rate: 0.4, minQty: 1, maxQty: 1 },
    ],
  },

  // ── 鳥類派生 ─────────────────────────────────────────────────────────────
  {
    id: "e-032",
    name: "暗黒の大鷹",
    type: "闇",
    level: 1,
    hp: 18, maxHp: 18, mp: 6, maxMp: 6,
    atk: 10, def: 3, spd: 12,
    sprite: "タカ.png",
    reward: { exp: 26, gold: 20 },
    catchRate: 0.12,
    personality: "いじっぱり",
    skills: ["急降下", "かぎ爪", "闇の翼"],
    drops: [
      { materialId: "mat-019", rate: 0.6, minQty: 1, maxQty: 2 },
      { materialId: "mat-017", rate: 0.4, minQty: 1, maxQty: 1 },
      { materialId: "mat-011", rate: 0.15, minQty: 1, maxQty: 1 },
    ],
  },

  // ── ねこ派生 ─────────────────────────────────────────────────────────────
  {
    id: "e-033",
    name: "魔法ネコ",
    type: "闇",
    level: 1,
    hp: 10, maxHp: 10, mp: 16, maxMp: 16,
    atk: 4, def: 2, spd: 10,
    sprite: "ねこ.png",
    reward: { exp: 20, gold: 16 },
    catchRate: 0.18,
    personality: "きまぐれ",
    skills: ["魔力波", "ネコパンチ", "カース"],
    drops: [
      { materialId: "mat-005", rate: 0.5, minQty: 1, maxQty: 2 },
      { materialId: "mat-017", rate: 0.5, minQty: 1, maxQty: 1 },
    ],
  },

  // ── 九尾の狐 ─────────────────────────────────────────────────────────────
  {
    id: "e-034",
    name: "九尾の狐",
    type: "炎",
    level: 1,
    hp: 22, maxHp: 22, mp: 20, maxMp: 20,
    atk: 10, def: 5, spd: 12,
    sprite: "きつね.png",
    reward: { exp: 45, gold: 35 },
    catchRate: 0.06,
    personality: "ずる賢い",
    skills: ["狐火", "九尾の炎", "かみつき", "まどわし"],
    drops: [
      { materialId: "mat-018", rate: 0.5, minQty: 1, maxQty: 2 },
      { materialId: "mat-009", rate: 0.5, minQty: 1, maxQty: 2 },
      { materialId: "mat-006", rate: 0.2, minQty: 1, maxQty: 1 },
    ],
  },

  // ── 古代ガメ ─────────────────────────────────────────────────────────────
  {
    id: "e-035",
    name: "古代ガメ",
    type: "地",
    level: 1,
    hp: 35, maxHp: 35, mp: 0, maxMp: 0,
    atk: 5, def: 20, spd: 1,
    sprite: "カメ.png",
    reward: { exp: 38, gold: 30 },
    catchRate: 0.06,
    personality: "のんき",
    skills: ["鉄壁の甲羅", "かみつき", "地震"],
    drops: [
      { materialId: "mat-020", rate: 0.8, minQty: 2, maxQty: 3 },
      { materialId: "mat-004", rate: 0.4, minQty: 1, maxQty: 2 },
    ],
  },
];

/** id → EnemyMaster の引きマップ */
export const ENEMY_MAP: Record<string, EnemyMaster> = Object.fromEntries(
  ENEMY_MASTER.map((e) => [e.id, e])
);
