import type { EnemyMaster } from "../../types/masters";

export const ENEMY_MASTER: EnemyMaster[] = [
  {
    id: "e-001",
    name: "スライムKING",
    type: "水",
    level: 1,
    hp: 10,
    maxHp: 10,
    mp: 1,
    maxMp: 1,
    atk: 3,
    def: 1,
    spd: 1,
    sprite: "SlimeBasic.png",
    reward: { exp: 10, gold: 10 },
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
    level: 1,
    hp: 15,
    maxHp: 15,
    mp: 0,
    maxMp: 0,
    atk: 5,
    def: 3,
    spd: 1,
    sprite: "DefaultBoy.png",
    reward: { exp: 20, gold: 20 },
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
    level: 1,
    hp: 10,
    maxHp: 10,
    mp: 10,
    maxMp: 10,
    atk: 7,
    def: 2,
    spd: 2,
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
