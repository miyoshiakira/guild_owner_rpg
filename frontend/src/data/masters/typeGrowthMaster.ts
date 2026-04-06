import type { MonsterType } from "../../types/game";
import type { GrowthCoeff } from "./personalityMaster";

// ===== 種族（属性）成長マスタ =====
// 各属性種族が持つ固有の成長傾向を定義する。
// 係数は 1.0 が基準。性格係数と重ね合わせて使用する。

export interface TypeGrowthMaster {
  type:        MonsterType;
  description: string;
  growth:      GrowthCoeff;
}

export const TYPE_GROWTH_MASTER: TypeGrowthMaster[] = [
  {
    type: "炎",
    description: "攻撃と素早さに優れた戦闘特化種族。HPはやや低め。",
    growth: { hp: 1.0, mp: 0.9, atk: 1.2, def: 0.9, spd: 1.1 },
  },
  {
    type: "水",
    description: "MPが大きく伸びる魔法系種族。防御は標準で素早さはやや低め。",
    growth: { hp: 1.0, mp: 1.3, atk: 0.9, def: 1.0, spd: 0.9 },
  },
  {
    type: "地",
    description: "HPとDEFが大きく伸びる耐久特化種族。MPとSPDは伸びにくい。",
    growth: { hp: 1.3, mp: 0.7, atk: 1.0, def: 1.3, spd: 0.7 },
  },
  {
    type: "光",
    description: "MPとHPがバランスよく伸びる聖職系種族。全体的に安定している。",
    growth: { hp: 1.1, mp: 1.2, atk: 0.9, def: 1.1, spd: 0.9 },
  },
  {
    type: "闇",
    description: "ATKとMPが共に伸びる攻撃魔法系種族。HPとDEFは伸びにくい。",
    growth: { hp: 0.9, mp: 1.2, atk: 1.2, def: 0.9, spd: 1.0 },
  },
];

/** type → TypeGrowthMaster */
export const TYPE_GROWTH_MAP: Record<MonsterType, TypeGrowthMaster> = Object.fromEntries(
  TYPE_GROWTH_MASTER.map((t) => [t.type, t])
) as Record<MonsterType, TypeGrowthMaster>;

/** 未定義種族用フォールバック */
export const DEFAULT_TYPE_GROWTH: GrowthCoeff = {
  hp: 1.0, mp: 1.0, atk: 1.0, def: 1.0, spd: 1.0,
};
