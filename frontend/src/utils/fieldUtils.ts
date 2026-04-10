import type { EnemyMaster } from "../types/masters";
import type { Enemy } from "../types/game";

/**
 * マップの baseLevel と levelVariance からランダムなレベルを決定する。
 */
export function mapLevel(baseLevel: number, levelVariance: number): number {
  return baseLevel + Math.floor(Math.random() * (levelVariance + 1));
}

/**
 * Lv1 マスタデータを指定レベルにスケーリングして Enemy を生成する。
 */
export function scaleEnemy(master: EnemyMaster, level: number, uid: string): Enemy {
  const f = 1 + (level - 1) * 0.35;
  const hp = Math.round(master.maxHp * f);
  return {
    ...master,
    id: uid,
    masterId: master.id,
    level,
    hp,
    maxHp: hp,
    mp:    Math.round(master.maxMp * f),
    maxMp: Math.round(master.maxMp * f),
    atk:   Math.round(master.atk * f),
    def:   Math.round(master.def * f),
    spd:   Math.round(master.spd * f),
    reward: {
      exp:  Math.round(master.reward.exp  * Math.pow(level, 1.4)),
      gold: Math.round(master.reward.gold * Math.pow(level, 1.2)),
    },
  };
}
