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

  // ── 追加装備レシピ: 武器 ────────────────────────────────────────────
  {
    id: "craft-009",
    name: "鱗の槍",
    description: "魚や爬虫類の鱗を束ねて作った軽量な槍。速度が上がる",
    emoji: "🔱",
    ingredients: [
      { materialId: "mat-012", qty: 3 }, // 鱗 x3
      { materialId: "mat-007", qty: 1 }, // ゴブリンの牙 x1
    ],
    result: {
      type: "equipment",
      name: "鱗の槍",
      slot: "weapon",
      effect: "ATK+5 SPD+2",
      atkBonus: 5,
      defBonus: 0,
      spdBonus: 2,
      sprite: "🔱",
    },
    resultQty: 1,
  },
  {
    id: "craft-010",
    name: "炎剣",
    description: "炎の結晶と炎の鱗を融合させた高威力の剣",
    emoji: "🔥",
    ingredients: [
      { materialId: "mat-009", qty: 2 }, // 炎の結晶 x2
      { materialId: "mat-016", qty: 1 }, // 炎の鱗 x1
      { materialId: "mat-004", qty: 1 }, // 硬い骨 x1
    ],
    result: {
      type: "equipment",
      name: "炎剣",
      slot: "weapon",
      effect: "ATK+8",
      atkBonus: 8,
      defBonus: 0,
      spdBonus: 0,
      sprite: "🔥",
    },
    resultQty: 1,
  },
  {
    id: "craft-011",
    name: "毒の短剣",
    description: "毒の牙を削って作った素早い短剣。敵に毒を付与する",
    emoji: "🗡️",
    ingredients: [
      { materialId: "mat-015", qty: 2 }, // 毒の牙 x2
      { materialId: "mat-007", qty: 1 }, // ゴブリンの牙 x1
    ],
    result: {
      type: "equipment",
      name: "毒の短剣",
      slot: "weapon",
      effect: "ATK+4 SPD+4",
      atkBonus: 4,
      defBonus: 0,
      spdBonus: 4,
      sprite: "🗡️",
    },
    resultQty: 1,
  },
  {
    id: "craft-012",
    name: "竜骨の大剣",
    description: "竜の牙と硬い骨で鍛えた最強クラスの大剣",
    emoji: "⚔️",
    ingredients: [
      { materialId: "mat-014", qty: 1 }, // 竜の牙 x1
      { materialId: "mat-013", qty: 2 }, // 鉄の欠片 x2
      { materialId: "mat-004", qty: 3 }, // 硬い骨 x3
    ],
    result: {
      type: "equipment",
      name: "竜骨の大剣",
      slot: "weapon",
      effect: "ATK+12",
      atkBonus: 12,
      defBonus: 0,
      spdBonus: 0,
      sprite: "⚔️",
    },
    resultQty: 1,
  },

  // ── 追加装備レシピ: 防具 ────────────────────────────────────────────
  {
    id: "craft-013",
    name: "鱗の胸当て",
    description: "魚竜の鱗を鉄で補強した堅牢な胸当て",
    emoji: "🛡️",
    ingredients: [
      { materialId: "mat-012", qty: 3 }, // 鱗 x3
      { materialId: "mat-013", qty: 1 }, // 鉄の欠片 x1
    ],
    result: {
      type: "equipment",
      name: "鱗の胸当て",
      slot: "armor",
      effect: "DEF+7",
      atkBonus: 0,
      defBonus: 7,
      spdBonus: 0,
      sprite: "🛡️",
    },
    resultQty: 1,
  },
  {
    id: "craft-014",
    name: "鉄の鎧",
    description: "ゴーレムの鉄片を丁寧に鍛えた頑丈な鎧",
    emoji: "🪖",
    ingredients: [
      { materialId: "mat-013", qty: 4 }, // 鉄の欠片 x4
    ],
    result: {
      type: "equipment",
      name: "鉄の鎧",
      slot: "armor",
      effect: "DEF+9",
      atkBonus: 0,
      defBonus: 9,
      spdBonus: 0,
      sprite: "🪖",
    },
    resultQty: 1,
  },
  {
    id: "craft-015",
    name: "炎の外套",
    description: "炎の鱗を縫い込んだ魔法の外套。防御と攻撃を両立する",
    emoji: "🧣",
    ingredients: [
      { materialId: "mat-016", qty: 2 }, // 炎の鱗 x2
      { materialId: "mat-003", qty: 1 }, // 獣の毛皮 x1
      { materialId: "mat-005", qty: 1 }, // 魔法の粉 x1
    ],
    result: {
      type: "equipment",
      name: "炎の外套",
      slot: "armor",
      effect: "DEF+4 ATK+3",
      atkBonus: 3,
      defBonus: 4,
      spdBonus: 0,
      sprite: "🧣",
    },
    resultQty: 1,
  },

  // ── 追加装備レシピ: アクセサリ ──────────────────────────────────────
  {
    id: "craft-016",
    name: "竜牙のネックレス",
    description: "竜の牙と魔力の結晶を組み合わせた強力なネックレス",
    emoji: "🐲",
    ingredients: [
      { materialId: "mat-014", qty: 1 }, // 竜の牙 x1
      { materialId: "mat-006", qty: 1 }, // 魔力の結晶 x1
    ],
    result: {
      type: "equipment",
      name: "竜牙のネックレス",
      slot: "accessory",
      effect: "ATK+5 DEF+2",
      atkBonus: 5,
      defBonus: 2,
      spdBonus: 0,
      sprite: "🐲",
    },
    resultQty: 1,
  },
  {
    id: "craft-017",
    name: "氷の指輪",
    description: "氷の欠片を魔法で固めた指輪。装備者の身のこなしを鋭くする",
    emoji: "🧊",
    ingredients: [
      { materialId: "mat-010", qty: 3 }, // 氷の欠片 x3
      { materialId: "mat-002", qty: 1 }, // スライムコア x1
    ],
    result: {
      type: "equipment",
      name: "氷の指輪",
      slot: "accessory",
      effect: "SPD+6 DEF+1",
      atkBonus: 0,
      defBonus: 1,
      spdBonus: 6,
      sprite: "🧊",
    },
    resultQty: 1,
  },
  {
    id: "craft-018",
    name: "悪魔の骨飾り",
    description: "悪魔の角と骨片で作った禍々しい装飾品。全ステータスを底上げする",
    emoji: "😈",
    ingredients: [
      { materialId: "mat-011", qty: 1 }, // 悪魔の角 x1
      { materialId: "mat-008", qty: 3 }, // 骨片 x3
    ],
    result: {
      type: "equipment",
      name: "悪魔の骨飾り",
      slot: "accessory",
      effect: "ATK+3 DEF+3 SPD+2",
      atkBonus: 3,
      defBonus: 3,
      spdBonus: 2,
      sprite: "😈",
    },
    resultQty: 1,
  },

  // ── 獣系素材レシピ ───────────────────────────────────────────────────
  {
    id: "craft-019",
    name: "爪の短剣",
    description: "獣の爪を束ねた素早い短剣。軽くて扱いやすい",
    emoji: "🦶",
    ingredients: [
      { materialId: "mat-017", qty: 2 }, // 獣の爪 x2
      { materialId: "mat-018", qty: 1 }, // 柔らかい毛皮 x1
    ],
    result: {
      type: "equipment",
      name: "爪の短剣",
      slot: "weapon",
      effect: "ATK+4 SPD+3",
      atkBonus: 4,
      defBonus: 0,
      spdBonus: 3,
      sprite: "🦶",
    },
    resultQty: 1,
  },
  {
    id: "craft-020",
    name: "羽根の弓",
    description: "タカの羽根で矢羽を作った軽量の弓。射速が高い",
    emoji: "🏹",
    ingredients: [
      { materialId: "mat-019", qty: 3 }, // 羽根 x3
      { materialId: "mat-004", qty: 1 }, // 硬い骨 x1
    ],
    result: {
      type: "equipment",
      name: "羽根の弓",
      slot: "weapon",
      effect: "ATK+3 SPD+5",
      atkBonus: 3,
      defBonus: 0,
      spdBonus: 5,
      sprite: "🏹",
    },
    resultQty: 1,
  },
  {
    id: "craft-021",
    name: "柔皮の外套",
    description: "小動物の柔らかい毛皮を縫い合わせた軽量外套。動きやすい",
    emoji: "🐰",
    ingredients: [
      { materialId: "mat-018", qty: 3 }, // 柔らかい毛皮 x3
    ],
    result: {
      type: "equipment",
      name: "柔皮の外套",
      slot: "armor",
      effect: "DEF+3 SPD+2",
      atkBonus: 0,
      defBonus: 3,
      spdBonus: 2,
      sprite: "🐰",
    },
    resultQty: 1,
  },
  {
    id: "craft-022",
    name: "甲羅の大盾",
    description: "カメの甲羅を加工した超硬質の盾。防御力が大幅に上がる",
    emoji: "🐢",
    ingredients: [
      { materialId: "mat-020", qty: 2 }, // 甲羅片 x2
      { materialId: "mat-013", qty: 1 }, // 鉄の欠片 x1
    ],
    result: {
      type: "equipment",
      name: "甲羅の大盾",
      slot: "armor",
      effect: "DEF+10",
      atkBonus: 0,
      defBonus: 10,
      spdBonus: 0,
      sprite: "🐢",
    },
    resultQty: 1,
  },
  {
    id: "craft-023",
    name: "爪のブレスレット",
    description: "獣の爪を連ねたブレスレット。装備者の攻撃を鋭くする",
    emoji: "🦶",
    ingredients: [
      { materialId: "mat-017", qty: 3 }, // 獣の爪 x3
    ],
    result: {
      type: "equipment",
      name: "爪のブレスレット",
      slot: "accessory",
      effect: "ATK+3 SPD+2",
      atkBonus: 3,
      defBonus: 0,
      spdBonus: 2,
      sprite: "🦶",
    },
    resultQty: 1,
  },
];
export const CRAFT_RECIPE_MAP: Record<string, CraftRecipe> = Object.fromEntries(
  CRAFT_RECIPE_MASTER.map((r) => [r.id, r])
);
