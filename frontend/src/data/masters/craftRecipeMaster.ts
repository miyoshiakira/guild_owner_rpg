import type { CraftRecipe } from "../../types/masters";
import { getEquipmentById } from "./equipmentMaster";

export const CRAFT_RECIPE_MASTER: CraftRecipe[] = [
  // === 武器レシピ ===
  {
    id: "craft-001",
    name: "石の剣", // 装備名に合わせ「骨」から「石」へ変更
    description: "硬い骨や石を削って作った粗末な剣",
    emoji: "🗡️",
    ingredients: [
      { materialId: "mat-004", qty: 2 }, // 硬い骨 x2
    ],
    result: getEquipmentById("eq-001"),
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
    result: getEquipmentById("eq-002"),
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
    result: getEquipmentById("eq-003"),
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
    result: getEquipmentById("eq-004"),
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
    result: getEquipmentById("eq-005"),
    resultQty: 1,
  },
  {
    id: "craft-006",
    name: "魔法の帽子", // 「アミュレット」から装備名に合わせて修正
    description: "魔法の粉を練り込んだ不思議な帽子",
    emoji: "🎩",
    ingredients: [
      { materialId: "mat-005", qty: 2 }, // 魔法の粉 x2
      { materialId: "mat-002", qty: 1 }, // スライムコア x1
    ],
    result: getEquipmentById("eq-014"), // 魔法の帽子のID
    resultQty: 1,
  },

  // === 消耗品レシピ (変更なし) ===
  {
    id: "craft-007",
    name: "回復ポーション",
    description: "スライムゼリーをベースにした回復薬",
    emoji: "🧪",
    ingredients: [{ materialId: "mat-001", qty: 2 }],
    result: {
      type: "item",
      id: "potion-001",
      name: "回復ポーション",
      itemType: "消耗品",
      effect: "HPを30回復",
      sprite: "🧪",
    },
    resultQty: 2,
  },

  // === 中級・上級装備レシピ (修正版) ===
  {
    id: "craft-009",
    name: "トライデント", // 「鱗の槍」から修正
    description: "魚や爬虫類の鱗を束ねて作った軽量な槍",
    emoji: "🔱",
    ingredients: [
      { materialId: "mat-012", qty: 3 },
      { materialId: "mat-007", qty: 1 },
    ],
    result: getEquipmentById("eq-010"),
    resultQty: 1,
  },
  {
    id: "craft-010",
    name: "鉄の剣", // 「炎剣」から修正
    description: "鉄の欠片を融合させた高威力の剣",
    emoji: "⚔️",
    ingredients: [
      { materialId: "mat-009", qty: 2 },
      { materialId: "mat-013", qty: 1 },
    ],
    result: getEquipmentById("eq-008"),
    resultQty: 1,
  },
  {
    id: "craft-011",
    name: "エルフの弓", // 「毒の短剣」から修正
    description: "しなやかな木材と魔力を組み合わせた弓",
    emoji: "🏹",
    ingredients: [
      { materialId: "mat-015", qty: 2 },
      { materialId: "mat-007", qty: 1 },
    ],
    result: getEquipmentById("eq-015"),
    resultQty: 1,
  },
  {
    id: "craft-012",
    name: "氷結晶の剣", // 「竜骨の大剣」から修正
    description: "氷の結晶で鍛えた美しい剣",
    emoji: "🧊",
    ingredients: [
      { materialId: "mat-014", qty: 1 },
      { materialId: "mat-013", qty: 2 },
    ],
    result: getEquipmentById("eq-018"),
    resultQty: 1,
  },
  {
    id: "craft-013",
    name: "砂漠の服", // 「鱗の胸当て」から修正
    description: "砂漠の過酷な環境に耐えるための服",
    emoji: "🏜️",
    ingredients: [
      { materialId: "mat-012", qty: 3 },
      { materialId: "mat-013", qty: 1 },
    ],
    result: getEquipmentById("eq-011"),
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
    result: getEquipmentById("eq-009"),
    resultQty: 1,
  },
  {
    id: "craft-015",
    name: "レザーアーマー", // 「炎の外套」から修正
    description: "獣の皮を幾重にも重ねた防御力の高い防具",
    emoji: "🦺",
    ingredients: [
      { materialId: "mat-016", qty: 2 },
      { materialId: "mat-003", qty: 1 },
    ],
    result: getEquipmentById("eq-016"),
    resultQty: 1,
  },
  {
    id: "craft-022",
    name: "古代の兜", // 「甲羅の大盾」から修正
    description: "古代の技術で作られた非常に硬い兜",
    emoji: "⛑️",
    ingredients: [
      { materialId: "mat-020", qty: 2 },
      { materialId: "mat-013", qty: 1 },
    ],
    result: getEquipmentById("eq-030"),
    resultQty: 1,
  },
];

export const CRAFT_RECIPE_MAP: Record<string, CraftRecipe> = Object.fromEntries(
  CRAFT_RECIPE_MASTER.map((r) => [r.id, r])
);