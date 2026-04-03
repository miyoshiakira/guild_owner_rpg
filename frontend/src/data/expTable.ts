/**
 * 経験値テーブル
 * getExpToNextLevel(level) でレベル N → N+1 に必要な EXP を取得する
 *
 * 設計方針: floor(50 * level^1.8) によるなだらかな指数カーブ
 *   Lv1 →  2:    50 EXP
 *   Lv5 →  6:   253 EXP
 *  Lv10 → 11:   630 EXP
 *  Lv20 → 21: 1,637 EXP
 *  Lv50 → 51: 6,725 EXP
 *  Lv99 →100:18,691 EXP
 */

export const MAX_LEVEL = 99;

/**
 * レベル N → N+1 に必要な EXP の一覧（インデックス 0 = Lv1→2）
 * 読み取り専用のため直接書き換え不可
 */
export const EXP_TABLE: readonly number[] = Object.freeze(
  Array.from({ length: MAX_LEVEL }, (_, i) =>
    Math.floor(50 * Math.pow(i + 1, 1.8))
  )
);

/**
 * 現在のレベルから次のレベルに上がるために必要な EXP を返す
 * @param level 現在のレベル（1 以上）
 * @returns 必要 EXP。MAX_LEVEL 以上の場合は最終段階の値を返す
 */
export function getExpToNextLevel(level: number): number {
  const idx = Math.min(Math.max(level - 1, 0), MAX_LEVEL - 1);
  return EXP_TABLE[idx]!;
}
