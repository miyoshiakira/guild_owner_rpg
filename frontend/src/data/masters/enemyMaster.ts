import type { EnemyMaster } from "../../types/masters";
import enemiesJson from './json/enemies.json';

/**
 * 敵マスタ — レベルはすべて 1 基準。
 * 実際のレベル・ステータスはフィールドスポーン時に
 * 原点(0,0)からの距離に基づいてスケーリングされる。
 */
export const ENEMY_MASTER: EnemyMaster[] = enemiesJson as EnemyMaster[];

/** id → EnemyMaster の引きマップ */
export const ENEMY_MAP: Record<string, EnemyMaster> = Object.fromEntries(
  ENEMY_MASTER.map((e) => [e.id, e])
);