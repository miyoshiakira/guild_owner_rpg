import type { MonsterType } from "../../types/game";
import type { GrowthCoeff } from "./personalityMaster";
import typeGrowthJson from './json/typeGrowth.json';

// ===== 種族（属性）成長マスタ =====
// 各属性種族が持つ固有の成長傾向を定義する。
// 係数は 1.0 が基準。性格係数と重ね合わせて使用する。

export interface TypeGrowthMaster {
  type:        MonsterType;
  description: string;
  growth:      GrowthCoeff;
}

export const TYPE_GROWTH_MASTER: TypeGrowthMaster[] = typeGrowthJson as TypeGrowthMaster[];

/** type → TypeGrowthMaster */
export const TYPE_GROWTH_MAP: Record<MonsterType, TypeGrowthMaster> = Object.fromEntries(
  TYPE_GROWTH_MASTER.map((t) => [t.type, t])
) as Record<MonsterType, TypeGrowthMaster>;

/** 未定義種族用フォールバック */
export const DEFAULT_TYPE_GROWTH: GrowthCoeff = {
  hp: 1.0, mp: 1.0, atk: 1.0, def: 1.0, spd: 1.0,
};