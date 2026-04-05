import type { CraftRecipe, CraftResultEquipment } from "../../types/masters";
import { getEquipmentById } from "./equipmentMaster";

/**
 * equipmentMaster のエントリを CraftResultEquipment に変換するヘルパー。
 * Equipment 型にある id / equippedTo はクラフト結果テンプレートには不要なため除外し、
 * type: "equipment" を付与する。
 */
function equipResult(masterId: string): CraftResultEquipment {
  const eq = getEquipmentById(masterId);
  if (!eq) throw new Error(`craftRecipeMaster: equipmentMaster に "${masterId}" が存在しません`);
  const { id: _id, equippedTo: _equippedTo, ...rest } = eq;
  return { type: "equipment", ...rest };
}

export const CRAFT_RECIPE_MASTER: CraftRecipe[] = [
  // === 武器レシピ ===
  {
    id: "craft-001",
    name: "石の剣",
    description: "硬い骨や石を削って作った粗末な剣",
    emoji: "🗡️",
    ingredients: [
      { materialId: "mat-004", qty: 2 }, // 硬い骨 x2
    ],
    result: equipResult("eq-001"),
    resultQty: 1,
  },
  {
    id: "craft-002",
    name: "魔法の杖",
    description: "魔力の結晶を埋め込んだ杖",
    emoji: "🪄",
    ingredients: [
      { materialId: "mat-006", qty: 1 }, // 魔力の結晶 x1
      { materialId: "mat-004", qty: 1 }, // 硬い骨 x1
    ],
    result: equipResult("eq-002"),
    resultQty: 1,
  },

  // === 防具レシピ ===
  {
    id: "craft-003",
    name: "毛皮の鎧",
    description: "獣の毛皮で作った暖かい鎧",
    emoji: "🧥",
    ingredients: [
      { materialId: "mat-003", qty: 2 }, // 獣の毛皮 x2
    ],
    result: equipResult("eq-003"),
    resultQty: 1,
  },
  {
    id: "craft-004",
    name: "スライムゼリーアーマー",
    description: "スライムゼリーを固めて作った不思議な鎧",
    emoji: "🟢",
    ingredients: [
      { materialId: "mat-001", qty: 3 }, // スライムゼリー x3
      { materialId: "mat-003", qty: 1 }, // 獣の毛皮 x1
    ],
    result: equipResult("eq-004"),
    resultQty: 1,
  },

  // === アクセサリレシピ ===
  {
    id: "craft-005",
    name: "スライムコアリング",
    description: "スライムコアを加工した指輪",
    emoji: "💠",
    ingredients: [
      { materialId: "mat-002", qty: 1 }, // スライムコア x1
    ],
    result: equipResult("eq-005"),
    resultQty: 1,
  },
  {
    id: "craft-006",
    name: "魔法の帽子",
    description: "魔法の粉を練り込んだ不思議な帽子",
    emoji: "🎩",
    ingredients: [
      { materialId: "mat-005", qty: 2 }, // 魔法の粉 x2
      { materialId: "mat-002", qty: 1 }, // スライムコア x1
    ],
    result: equipResult("eq-014"),
    resultQty: 1,
  },

  // === 消耗品レシピ ===
  {
    id: "craft-007",
    name: "回復ポーション",
    description: "スライムゼリーをベースにした回復薬",
    emoji: "🧪",
    ingredients: [{ materialId: "mat-001", qty: 2 }],
    result: {
      type: "item",
      id: "item-001",        // itemMaster / initData の ID と一致させる
      name: "回復ポーション",
      itemType: "消耗品",
      effect: "HPを30回復",
      sprite: "🧪",
    },
    resultQty: 2,
  },

  // === 中級・上級装備レシピ ===
  {
    id: "craft-009",
    name: "トライデント",
    description: "魚や爬虫類の鱗を束ねて作った軽量な槍",
    emoji: "🔱",
    ingredients: [
      { materialId: "mat-012", qty: 3 },
      { materialId: "mat-007", qty: 1 },
    ],
    result: equipResult("eq-010"),
    resultQty: 1,
  },
  {
    id: "craft-010",
    name: "鉄の剣",
    description: "鉄の欠片を融合させた高威力の剣",
    emoji: "⚔️",
    ingredients: [
      { materialId: "mat-009", qty: 2 },
      { materialId: "mat-013", qty: 1 },
    ],
    result: equipResult("eq-008"),
    resultQty: 1,
  },
  {
    id: "craft-011",
    name: "エルフの弓",
    description: "しなやかな木材と魔力を組み合わせた弓",
    emoji: "🏹",
    ingredients: [
      { materialId: "mat-015", qty: 2 },
      { materialId: "mat-007", qty: 1 },
    ],
    result: equipResult("eq-015"),
    resultQty: 1,
  },
  {
    id: "craft-012",
    name: "氷結晶の剣",
    description: "氷の結晶で鍛えた美しい剣",
    emoji: "🧊",
    ingredients: [
      { materialId: "mat-014", qty: 1 },
      { materialId: "mat-013", qty: 2 },
    ],
    result: equipResult("eq-018"),
    resultQty: 1,
  },
  {
    id: "craft-013",
    name: "砂漠の服",
    description: "砂漠の過酷な環境に耐えるための服",
    emoji: "🏜️",
    ingredients: [
      { materialId: "mat-012", qty: 3 },
      { materialId: "mat-013", qty: 1 },
    ],
    result: equipResult("eq-011"),
    resultQty: 1,
  },
  {
    id: "craft-014",
    name: "鉄の鎧",
    description: "ゴーレムの鉄片を丁寧に鍛えた頑丈な鎧",
    emoji: "🛡️",
    ingredients: [
      { materialId: "mat-013", qty: 4 },
    ],
    result: equipResult("eq-009"),
    resultQty: 1,
  },
  {
    id: "craft-015",
    name: "レザーアーマー",
    description: "獣の皮を幾重にも重ねた防御力の高い防具",
    emoji: "🦺",
    ingredients: [
      { materialId: "mat-016", qty: 2 },
      { materialId: "mat-003", qty: 1 },
    ],
    result: equipResult("eq-016"),
    resultQty: 1,
  },
  {
    id: "craft-022",
    name: "古代の兜",
    description: "古代の技術で作られた非常に硬い兜",
    emoji: "⛑️",
    ingredients: [
      { materialId: "mat-020", qty: 2 },
      { materialId: "mat-013", qty: 1 },
    ],
    result: equipResult("eq-030"),
    resultQty: 1,
  },

  // === 新エリアレシピ ===
  {
    id: "craft-023",
    name: "深海の宝剣",
    description: "深海の宝珠と竜の牙を組み合わせた海の剣",
    emoji: "🔱",
    ingredients: [
      { materialId: "mat-022", qty: 1 },
      { materialId: "mat-014", qty: 2 },
    ],
    result: equipResult("eq-032"),
    resultQty: 1,
  },
  {
    id: "craft-024",
    name: "海竜の鎧",
    description: "深海の宝珠と鱗で鍛えた重厚な鎧",
    emoji: "🐉",
    ingredients: [
      { materialId: "mat-022", qty: 1 },
      { materialId: "mat-012", qty: 4 },
    ],
    result: equipResult("eq-033"),
    resultQty: 1,
  },
  {
    id: "craft-025",
    name: "炎の剣",
    description: "炎玉と竜の鱗を溶かし込んだ炎を帯びた剣",
    emoji: "🔥",
    ingredients: [
      { materialId: "mat-028", qty: 2 },
      { materialId: "mat-026", qty: 1 },
    ],
    result: equipResult("eq-035"),
    resultQty: 1,
  },
  {
    id: "craft-026",
    name: "竜の鱗の鎧",
    description: "古竜の鱗を何枚も重ねた最高級の鎧",
    emoji: "🐲",
    ingredients: [
      { materialId: "mat-026", qty: 3 },
      { materialId: "mat-003", qty: 2 },
    ],
    result: equipResult("eq-036"),
    resultQty: 1,
  },
  {
    id: "craft-027",
    name: "氷晶の剣",
    description: "氷晶石の冷気を刃に閉じ込めた速さの剣",
    emoji: "💎",
    ingredients: [
      { materialId: "mat-027", qty: 2 },
      { materialId: "mat-013", qty: 2 },
    ],
    result: equipResult("eq-037"),
    resultQty: 1,
  },
  {
    id: "craft-028",
    name: "天使の弓",
    description: "天使の羽と魔力の結晶で作られた神弓",
    emoji: "🏹",
    ingredients: [
      { materialId: "mat-025", qty: 2 },
      { materialId: "mat-006", qty: 2 },
    ],
    result: equipResult("eq-039"),
    resultQty: 1,
  },
  {
    id: "craft-029",
    name: "魔王の剣",
    description: "魔王の角から削り出した究極の剣",
    emoji: "😡",
    ingredients: [
      { materialId: "mat-024", qty: 1 },
      { materialId: "mat-023", qty: 2 },
    ],
    result: equipResult("eq-041"),
    resultQty: 1,
  },
];

export const CRAFT_RECIPE_MAP: Record<string, CraftRecipe> = Object.fromEntries(
  CRAFT_RECIPE_MASTER.map((r) => [r.id, r])
);
