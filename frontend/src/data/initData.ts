/**
 * initData.ts — ゲーム開始直後の初期状態
 *
 * すべての値をマスタから参照して構築する。
 * 直接ハードコードせず、マスタの変更が自動的に反映される。
 */
import type { Player, Monster, Equipment, Item } from "../types/game";
import { PARTY_MEMBER_MASTER, type PartyMemberTemplate } from "./masters/partyMemberMaster";
import { ITEM_MAP } from "./masters/itemMaster";
import { EQUIPMENT_MAP } from "./masters/equipmentMaster";
import { ENEMY_MAP } from "./masters/enemyMaster";
import { getExpToNextLevel } from "./expTable";

// ── ヘルパー ─────────────────────────────────────────────────────────────────

/** 英雄テンプレート → Monster インスタンスへ変換 */
function makeMonsterFromHero(tmpl: PartyMemberTemplate, instanceId: string): Monster {
  return {
    id: instanceId,
    name: tmpl.name,
    type: tmpl.type,
    race: tmpl.race,
    level: 1,
    hp: tmpl.maxHp,
    maxHp: tmpl.maxHp,
    mp: tmpl.maxMp,
    maxMp: tmpl.maxMp,
    atk: tmpl.atk,
    def: tmpl.def,
    spd: tmpl.spd,
    personality: tmpl.personality,
    sprite: tmpl.sprite,
    skills: [...tmpl.skills],
    isParty: true,
    equipped: { weapon: null, armor: null, accessory: null },
    exp: 0,
    expNext: getExpToNextLevel(1),
  };
}

/** EnemyMaster → Monster インスタンスへ変換（Lv1固定） */
function makeMonsterFromEnemy(masterId: string, instanceId: string): Monster {
  const master = ENEMY_MAP[masterId];
  if (!master) throw new Error(`enemyMaster に "${masterId}" が存在しません`);
  return {
    id: instanceId,
    name: master.name,
    type: master.type,
    race: master.race,
    level: 1,
    hp: master.maxHp,
    maxHp: master.maxHp,
    mp: master.maxMp,
    maxMp: master.maxMp,
    atk: master.atk,
    def: master.def,
    spd: master.spd,
    personality: master.personality,
    sprite: master.sprite,
    skills: [...master.skills],
    isParty: true,
    equipped: { weapon: null, armor: null, accessory: null },
    exp: 0,
    expNext: getExpToNextLevel(1),
  };
}

/** EquipmentMaster → 所持品インスタンスへ変換（equippedTo = null） */
function makeEquipInstance(masterId: string, instanceId: string): Equipment {
  const master = EQUIPMENT_MAP[masterId];
  if (!master) throw new Error(`equipmentMaster に "${masterId}" が存在しません`);
  return { ...master, id: instanceId, equippedTo: null };
}

/** ItemMaster → Item インスタンスへ変換 */
function makeItem(itemId: string, quantity: number): Item {
  const tmpl = ITEM_MAP[itemId];
  if (!tmpl) throw new Error(`itemMaster に "${itemId}" が存在しません`);
  return { ...tmpl, quantity };
}

// ── 初期プレイヤー ────────────────────────────────────────────────────────────

export const INIT_PLAYER: Player = {
  id: "player-001",
  name: "ギルドマスター",
  level: 1,
  exp: 0,
  expNext: 100,
  gold: 50,
  hp: 50,
  maxHp: 50,
  mp: 20,
  maxMp: 20,
  syncStatus: "synced",
};

// ── 初期パーティメンバー ───────────────────────────────────────────────────────
// 英雄キャラは partyMemberMaster から、スカウト済みモンスターは enemyMaster から生成

export const INIT_MONSTERS: Monster[] = [
  makeMonsterFromHero(PARTY_MEMBER_MASTER[0]!, "mon-001"), // 男性剣士
  makeMonsterFromHero(PARTY_MEMBER_MASTER[1]!, "mon-002"), // 女性剣士
  makeMonsterFromEnemy("e-001", "mon-003"),                 // スライム
];

// ── 初期装備品 ────────────────────────────────────────────────────────────────
// equipmentMaster の ID を指定してインスタンスを生成

export const INIT_EQUIPMENT: Equipment[] = [
  makeEquipInstance("eq-001", "init-eq-001"), // 石の剣
  makeEquipInstance("eq-006", "init-eq-002"), // 皮の鎧
  makeEquipInstance("eq-007", "init-eq-003"), // スライムぼうし
];

// ── 初期アイテム ──────────────────────────────────────────────────────────────
// itemMaster の ID と初期個数を指定

export const INIT_ITEMS: Item[] = [
  makeItem("item-001", 3), // 回復ポーション ×3
  makeItem("item-002", 2), // 魔力ポーション ×2
  makeItem("item-003", 1), // ハイポーション ×1
  makeItem("item-004", 2), // どくけし草    ×2
];
