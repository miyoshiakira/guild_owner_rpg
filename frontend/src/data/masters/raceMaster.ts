import type { GrowthCoeff } from "./personalityMaster";
import racesJson from './json/races.json';

// ===== 種族マスタ =====
// モンスターの種族ごとの成長傾向を定義する。
// 係数は 1.0 が基準。性格係数・属性係数と重ね合わせて使用する。

export interface RaceMaster {
  name:        string;
  description: string;
  growth:      GrowthCoeff;
}

export const RACE_MASTER: RaceMaster[] = racesJson as RaceMaster[];

/** name → RaceMaster */
export const RACE_MAP: Record<string, RaceMaster> = Object.fromEntries(
  RACE_MASTER.map((r) => [r.name, r])
);

/** 未定義種族用フォールバック */
export const DEFAULT_RACE_GROWTH: GrowthCoeff = {
  hp: 1.0, mp: 1.0, atk: 1.0, def: 1.0, spd: 1.0,
};