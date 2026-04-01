import type { EnemyMaster } from "../../types/masters";

export const ENEMY_MASTER: EnemyMaster[] = [
  {
    id: "e-001",
    name: "スライムKING",
    type: "水",
    level: 6,
    hp: 80,
    maxHp: 80,
    mp: 30,
    maxMp: 30,
    atk: 20,
    def: 10,
    spd: 8,
    sprite: "SlimeBasic.png",
    reward: { exp: 60, gold: 30 },
    catchRate: 0.25,
    drops: [
      { materialId: "mat-001", rate: 0.8, minQty: 1, maxQty: 3 }, // スライムゼリー
      { materialId: "mat-002", rate: 0.3, minQty: 1, maxQty: 1 }, // スライムコア
    ],
  },
  {
    id: "e-002",
    name: "オーク",
    type: "地",
    level: 7,
    hp: 100,
    maxHp: 100,
    mp: 15,
    maxMp: 15,
    atk: 28,
    def: 22,
    spd: 6,
    sprite: "DefaultBoy.png",
    reward: { exp: 80, gold: 40 },
    catchRate: 0.15,
    drops: [
      { materialId: "mat-003", rate: 0.7, minQty: 1, maxQty: 2 }, // 獣の毛皮
      { materialId: "mat-004", rate: 0.4, minQty: 1, maxQty: 2 }, // 硬い骨
    ],
  },
  {
    id: "e-003",
    name: "ウィッチ",
    type: "闇",
    level: 8,
    hp: 60,
    maxHp: 60,
    mp: 80,
    maxMp: 80,
    atk: 35,
    def: 8,
    spd: 16,
    sprite: "DefaultGirl.png",
    reward: { exp: 100, gold: 55 },
    catchRate: 0.1,
    drops: [
      { materialId: "mat-005", rate: 0.6, minQty: 1, maxQty: 3 }, // 魔法の粉
      { materialId: "mat-006", rate: 0.2, minQty: 1, maxQty: 1 }, // 魔力の結晶
    ],
  },
];

/** id → EnemyMaster の引きマップ */
export const ENEMY_MAP: Record<string, EnemyMaster> = Object.fromEntries(
  ENEMY_MASTER.map((e) => [e.id, e])
);
