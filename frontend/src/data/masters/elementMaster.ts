import type { MonsterType } from "../../types/game";

/**
 * 属性相性テーブル
 * ELEMENT_CHART[攻撃属性][防御属性] = ダメージ係数
 *
 * 三角相性: 水→炎→地→水 (×1.5 / 逆方向×0.75)
 * 光闇対立: 光↔闇 (×2.0)
 * 同属性耐性: ×0.75
 * その他: ×1.0
 *
 *           防御→  水     地     光     炎     闇
 */
export const ELEMENT_CHART: Record<MonsterType, Record<MonsterType, number>> = {
  水: { 水: 0.75, 地: 0.75, 光: 1.0,  炎: 1.5,  闇: 1.0  },
  地: { 水: 1.5,  地: 0.75, 光: 1.0,  炎: 0.75, 闇: 1.0  },
  光: { 水: 1.0,  地: 1.0,  光: 0.75, 炎: 1.0,  闇: 2.0  },
  炎: { 水: 0.75, 地: 1.5,  光: 1.0,  炎: 0.75, 闇: 1.0  },
  闇: { 水: 1.0,  地: 1.0,  光: 2.0,  炎: 1.0,  闇: 0.75 },
};

/** 攻撃属性と防御属性から相性係数を取得する (属性なし = 1.0) */
export function getElementCoeff(
  attackElement: MonsterType | null | undefined,
  defenderType: MonsterType
): number {
  if (!attackElement) return 1.0;
  return ELEMENT_CHART[attackElement][defenderType];
}

/** 係数に応じた相性メッセージを返す (中立は空文字) */
export function getEffectivenessMsg(coeff: number): string {
  if (coeff >= 2.0) return "効果は抜群だ！";
  if (coeff >= 1.5) return "効果は大きかった！";
  if (coeff <= 0.75) return "効果は今ひとつ...";
  return "";
}
