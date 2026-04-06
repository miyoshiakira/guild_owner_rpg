import type { MonsterType } from "../../types/game";

/**
 * 初期パーティメンバー（英雄キャラ）のテンプレート定義。
 * スカウトで加入するモンスターは enemyMaster で管理する。
 */
export interface PartyMemberTemplate {
  id: string;         // テンプレートID (hero-001 など)
  name: string;
  type: MonsterType;
  race: string;       // 種族
  maxHp: number;
  maxMp: number;
  atk: number;
  def: number;
  spd: number;
  personality: string;
  sprite: string;
  skills: string[];   // skillMaster の name と対応
}

export const PARTY_MEMBER_MASTER: PartyMemberTemplate[] = [
  {
    id: "hero-001",
    name: "男性剣士",
    type: "地",
    race: "人型族",
    maxHp: 40,
    maxMp: 10,
    atk: 14,
    def: 10,
    spd: 9,
    personality: "いじっぱり",
    sprite: "男性剣士.png",
    skills: ["なぐる", "かばう"],
  },
  {
    id: "hero-002",
    name: "女性剣士",
    type: "光",
    race: "人型族",
    maxHp: 30,
    maxMp: 24,
    atk: 10,
    def: 8,
    spd: 14,
    personality: "おっとり",
    sprite: "女性剣士.png",
    skills: ["ひかりのかぜ", "ヒール"],
  },
];

export const PARTY_MEMBER_MAP: Record<string, PartyMemberTemplate> =
  Object.fromEntries(PARTY_MEMBER_MASTER.map((m) => [m.id, m]));
