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

export const PERSONALITY_MASTER: PersonalityMaster[] = [
  {
    name: "ふつう",
    description: "特に偏りのない標準的な成長をする。",
    growth: { hp: 1.0, mp: 1.0, atk: 1.0, def: 1.0, spd: 1.0 },
  },
  {
    name: "いじっぱり",
    description: "ATKが大きく伸びる代わりにMPが伸びにくい。物理アタッカー向き。",
    growth: { hp: 1.0, mp: 0.7, atk: 1.4, def: 1.0, spd: 1.0 },
  },
  {
    name: "のんき",
    description: "HPとDEFが伸びやすくATKとSPDが伸びにくい。タンク向き。",
    growth: { hp: 1.2, mp: 0.9, atk: 0.8, def: 1.3, spd: 0.8 },
  },
  {
    name: "おくびょう",
    description: "SPDが飛び抜けて伸びるがHP・DEFが伸びにくい。逃げ足型。",
    growth: { hp: 0.8, mp: 1.0, atk: 0.8, def: 0.8, spd: 1.5 },
  },
  {
    name: "やんちゃ",
    description: "ATKとSPDが伸びるがMPが伸びにくい。スピードアタッカー向き。",
    growth: { hp: 1.1, mp: 0.7, atk: 1.2, def: 0.9, spd: 1.2 },
  },
  {
    name: "なまいき",
    description: "DEFが大きく伸びるがSPDが伸びにくい。守りの盾向き。",
    growth: { hp: 1.0, mp: 1.0, atk: 1.0, def: 1.3, spd: 0.7 },
  },
  {
    name: "きまぐれ",
    description: "全体的に少し高めに伸びる。扱いやすい万能型。",
    growth: { hp: 1.1, mp: 1.1, atk: 1.1, def: 0.9, spd: 1.0 },
  },
  {
    name: "ずる賢い",
    description: "MPが大きく伸びてSPDも伸びるがHPとDEFが伸びにくい。魔法使い向き。",
    growth: { hp: 0.9, mp: 1.4, atk: 0.9, def: 0.8, spd: 1.1 },
  },
  {
    name: "すばしっこい",
    description: "SPDが圧倒的に伸びるが他のステータスは伸びにくい。先手必勝型。",
    growth: { hp: 0.8, mp: 1.0, atk: 0.9, def: 0.7, spd: 1.6 },
  },
  {
    name: "たかぶり",
    description: "ATKが最大級に伸びるがMPとDEFが非常に伸びにくい。超攻撃特化型。",
    growth: { hp: 1.1, mp: 0.7, atk: 1.5, def: 0.8, spd: 1.0 },
  },
  {
    name: "おっとり",
    description: "HPとMPがバランスよく伸びる優しい性格。全体的に安定した成長をする。",
    growth: { hp: 1.1, mp: 1.1, atk: 0.9, def: 0.9, spd: 1.0 },
  },
];

/** name → PersonalityMaster */
export const PERSONALITY_MAP: Record<string, PersonalityMaster> = Object.fromEntries(
  PERSONALITY_MASTER.map((p) => [p.name, p])
);

/** 未定義性格用フォールバック */
export const DEFAULT_PERSONALITY_GROWTH: GrowthCoeff = {
  hp: 1.0, mp: 1.0, atk: 1.0, def: 1.0, spd: 1.0,
};
