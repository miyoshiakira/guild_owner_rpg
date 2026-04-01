import type { CraftRecipe } from "../../types/masters";

export const CRAFT_RECIPE_MASTER: CraftRecipe[] = [
  // 武器レシピ
  {
    id: "craft-001",
    name: "骨の剣",
    description: "硬い骨を削って作った粗末な剣",
    emoji: "🗡️",
    ingredients: [
      { materialId: "mat-004", qty: 2 }, // 硬い骨 x2
    ],
    result: {
      type: "equipment",
      name: "骨の剣",
      slot: "weapon",
      effect: "ATK+3",
      atkBonus: 3,
      defBonus: 0,
      spdBonus: 0,
      sprite: "🗡️",
    },
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
    result: {
      type: "equipment",
      name: "魔法の杖",
      slot: "weapon",
      effect: "ATK+2 MP+10",
      atkBonus: 2,
      defBonus: 0,
      spdBonus: 0,
      sprite: "🪄",
    },
    resultQty: 1,
  },
  // 防具レシピ
  {
    id: "craft-003",
    name: "毛皮の鎧",
    description: "獣の毛皮で作った暖かい鎧",
    emoji: "🧥",
    ingredients: [
      { materialId: "mat-003", qty: 2 }, // 獣の毛皮 x2
    ],
    result: {
      type: "equipment",
      name: "毛皮の鎧",
      slot: "armor",
      effect: "DEF+4",
      atkBonus: 0,
      defBonus: 4,
      spdBonus: 0,
      sprite: "🧥",
    },
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
    result: {
      type: "equipment",
      name: "スライムゼリーアーマー",
      slot: "armor",
      effect: "DEF+2 HP+10",
      atkBonus: 0,
      defBonus: 2,
      spdBonus: 0,
      sprite: "🟢",
    },
    resultQty: 1,
  },
  // アクセサリレシピ
  {
    id: "craft-005",
    name: "スライムコアリング",
    description: "スライムコアを加工した指輪",
    emoji: "💠",
    ingredients: [
      { materialId: "mat-002", qty: 1 }, // スライムコア x1
    ],
    result: {
      type: "equipment",
      name: "スライムコアリング",
      slot: "accessory",
      effect: "DEF+1 SPD+2",
      atkBonus: 0,
      defBonus: 1,
      spdBonus: 2,
      sprite: "💠",
    },
    resultQty: 1,
  },
  {
    id: "craft-006",
    name: "魔法の粉アミュレット",
    description: "魔法の粉を封入したお守り",
    emoji: "✨",
    ingredients: [
      { materialId: "mat-005", qty: 2 }, // 魔法の粉 x2
      { materialId: "mat-002", qty: 1 }, // スライムコア x1
    ],
    result: {
      type: "equipment",
      name: "魔法の粉アミュレット",
      slot: "accessory",
      effect: "MP+15 SPD+1",
      atkBonus: 0,
      defBonus: 0,
      spdBonus: 1,
      sprite: "✨",
    },
    resultQty: 1,
  },
  // 消耗品レシピ
  {
    id: "craft-007",
    name: "回復ポーション",
    description: "スライムゼリーをベースにした回復薬",
    emoji: "🧪",
    ingredients: [
      { materialId: "mat-001", qty: 2 }, // スライムゼリー x2
    ],
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
  {
    id: "craft-008",
    name: "魔力ポーション",
    description: "魔法の粉を混ぜたMP回復薬",
    emoji: "💙",
    ingredients: [
      { materialId: "mat-005", qty: 1 }, // 魔法の粉 x1
      { materialId: "mat-001", qty: 1 }, // スライムゼリー x1
    ],
    result: {
      type: "item",
      id: "potion-002",
      name: "魔力ポーション",
      itemType: "消耗品",
      effect: "MPを20回復",
      sprite: "💙",
    },
    resultQty: 2,
  },
];

/** id → CraftRecipe の引きマップ */
export const CRAFT_RECIPE_MAP: Record<string, CraftRecipe> = Object.fromEntries(
  CRAFT_RECIPE_MASTER.map((r) => [r.id, r])
);
