import type { MonsterType } from "../../types/game";
import partyMembersJson from './json/partyMembers.json';

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

export const PARTY_MEMBER_MASTER: PartyMemberTemplate[] = partyMembersJson as PartyMemberTemplate[];

export const PARTY_MEMBER_MAP: Record<string, PartyMemberTemplate> =
  Object.fromEntries(PARTY_MEMBER_MASTER.map((m) => [m.id, m]));