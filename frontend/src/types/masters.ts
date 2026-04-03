import type { MonsterType, EquipSlot, ItemType, DropEntry } from "./game";

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

export interface CraftRecipe {
  id: string;
  name: string;
  description: string;
  emoji: string;
  ingredients: CraftIngredient[];
  result: CraftResult;
  resultQty: number;
}
