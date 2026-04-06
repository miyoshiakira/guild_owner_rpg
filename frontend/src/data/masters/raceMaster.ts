import type { GrowthCoeff } from "./personalityMaster";

// ===== 種族マスタ =====
// モンスターの種族ごとの成長傾向を定義する。
// 係数は 1.0 が基準。性格係数・属性係数と重ね合わせて使用する。

export interface RaceMaster {
  name:        string;
  description: string;
  growth:      GrowthCoeff;
}

export const RACE_MASTER: RaceMaster[] = [
  {
    name: "スライム族",
    description: "全体的に成長は控えめだが、MPがやや伸びやすい。初心者にも扱いやすい。",
    growth: { hp: 0.9, mp: 1.1, atk: 0.8, def: 1.0, spd: 0.8 },
  },
  {
    name: "獣族",
    description: "ATKとSPDが伸びやすい攻撃的な種族。アタッカーとして優秀。",
    growth: { hp: 1.1, mp: 0.8, atk: 1.1, def: 0.9, spd: 1.2 },
  },
  {
    name: "鳥族",
    description: "SPDが飛び抜けて伸びる高機動種族。HPとDEFは伸びにくい。",
    growth: { hp: 0.8, mp: 0.9, atk: 1.0, def: 0.8, spd: 1.5 },
  },
  {
    name: "水棲族",
    description: "MPが伸びやすい魔法親和性の高い種族。海の生物に多い。",
    growth: { hp: 1.0, mp: 1.2, atk: 0.9, def: 1.0, spd: 0.9 },
  },
  {
    name: "爬虫族",
    description: "HPとDEFが伸びやすいタフな種族。SPDは伸びにくい。",
    growth: { hp: 1.2, mp: 0.8, atk: 1.0, def: 1.2, spd: 0.8 },
  },
  {
    name: "アンデッド族",
    description: "ATKとDEFがバランスよく伸びる。SPDは低め。闇と骨格の力で戦う。",
    growth: { hp: 1.0, mp: 1.0, atk: 1.1, def: 1.1, spd: 0.8 },
  },
  {
    name: "人型族",
    description: "特に偏りのない均等な成長をする。スキルの多様性で補う汎用種族。",
    growth: { hp: 1.0, mp: 1.0, atk: 1.0, def: 1.0, spd: 1.0 },
  },
  {
    name: "悪魔族",
    description: "ATKとMPが共に伸びる攻撃的な種族。HPとDEFは低め。",
    growth: { hp: 0.9, mp: 1.3, atk: 1.2, def: 0.9, spd: 1.0 },
  },
  {
    name: "竜族",
    description: "全ステータスが高水準で成長する最強種族の一角。育成に時間がかかるが見返りは大きい。",
    growth: { hp: 1.3, mp: 1.0, atk: 1.3, def: 1.1, spd: 0.9 },
  },
  {
    name: "ゴーレム族",
    description: "HPとDEFが圧倒的に伸びる究極の盾役。MPとSPDはほとんど伸びない。",
    growth: { hp: 1.4, mp: 0.6, atk: 1.0, def: 1.4, spd: 0.6 },
  },
  {
    name: "精霊族",
    description: "MPが大きく伸びる魔法特化種族。防御は低く脆いが高火力魔法を連発できる。",
    growth: { hp: 0.9, mp: 1.4, atk: 0.9, def: 0.8, spd: 1.1 },
  },
  {
    name: "虫族",
    description: "DEFが伸びやすく毒など特殊攻撃が得意な種族。ATKとMPは伸びにくい。",
    growth: { hp: 1.1, mp: 0.7, atk: 0.9, def: 1.3, spd: 0.9 },
  },
  {
    name: "幻獣族",
    description: "MPとATKが共に伸びる魔法と物理の両立した幻の生物。扱いやすいバランス型。",
    growth: { hp: 1.0, mp: 1.2, atk: 1.1, def: 0.9, spd: 1.1 },
  },
  {
    name: "天使族",
    description: "HP・MP・DEFがバランスよく伸びる光の加護を持つ種族。安定した成長が特徴。",
    growth: { hp: 1.1, mp: 1.2, atk: 1.0, def: 1.1, spd: 1.0 },
  },
];

/** name → RaceMaster */
export const RACE_MAP: Record<string, RaceMaster> = Object.fromEntries(
  RACE_MASTER.map((r) => [r.name, r])
);

/** 未定義種族用フォールバック */
export const DEFAULT_RACE_GROWTH: GrowthCoeff = {
  hp: 1.0, mp: 1.0, atk: 1.0, def: 1.0, spd: 1.0,
};
