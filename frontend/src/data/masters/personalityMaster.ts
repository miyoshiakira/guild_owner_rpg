import personalitiesJson from './json/personalities.json';

// ===== 性格マスタ =====
// 各係数は 1.0 が基準。レベルアップ時の基礎乱数値に乗算される。

export interface GrowthCoeff {
  hp:  number; // 最大HP
  mp:  number; // 最大MP
  atk: number; // 攻撃力
  def: number; // 防御力
  spd: number; // 素早さ
}

export interface PersonalityMaster {
  name:        string;
  description: string;
  growth:      GrowthCoeff;
}

export const PERSONALITY_MASTER: PersonalityMaster[] = personalitiesJson as PersonalityMaster[];

/** name → PersonalityMaster */
export const PERSONALITY_MAP: Record<string, PersonalityMaster> = Object.fromEntries(
  PERSONALITY_MASTER.map((p) => [p.name, p])
);

/** 未定義性格用フォールバック */
export const DEFAULT_PERSONALITY_GROWTH: GrowthCoeff = {
  hp: 1.0, mp: 1.0, atk: 1.0, def: 1.0, spd: 1.0,
};