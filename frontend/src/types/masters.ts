import type { MonsterType, EquipSlot, ItemType, DropEntry } from "./game";

export type ElementType = MonsterType;

// ===== 素材アイテム =====
export interface MaterialItem {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

// ===== モンスターマスタ（Enemy + ドロップ定義） =====
export interface EnemyMaster {
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
  drops: DropEntry[];
  skills: string[];
  personality: string;
}

// ===== クラフトレシピ =====
export interface CraftIngredient {
  materialId: string;
  qty: number;
}

export interface CraftResultEquipment {
  type: "equipment";
  name: string;
  slot: EquipSlot;
  effect: string;
  atkBonus: number;
  defBonus: number;
  spdBonus: number;
  sprite: string;
  element?: MonsterType;
}

export interface CraftResultItem {
  type: "item";
  id: string;
  name: string;
  itemType: ItemType;
  effect: string;
  sprite: string;
}

export type CraftResult = CraftResultEquipment | CraftResultItem;

// ===== スキルマスタ =====
export interface SkillMaster {
  id: string;
  name: string;
  power: number;         // 威力（0 = ダメージなし / 状態異常・補助）
  description: string;   // 説明文
  mpCost: number;        // 消費MP
  element?: MonsterType; // 属性 (なしは無属性物理)
}

export interface CraftRecipe {
  id: string;
  name: string;
  description: string;
  emoji: string;
  ingredients: CraftIngredient[];
  result: CraftResult;
  resultQty: number;
}
