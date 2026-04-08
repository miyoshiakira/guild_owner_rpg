/**
 * ════════════════════════════════════════════════════════════════════
 * EQUIPMENT MASTER — 新規追加用スキーマ定義ファイル
 *
 * 【Claudeへの指示】
 *   このファイルを読んで _pending/equipment.pending.ts に新規エントリを書いてください。
 *
 * 【次に使うID】
 *   eq-044
 *
 * 【マージ方法】
 *   node scripts/mergeMaster.mjs equipment
 * ════════════════════════════════════════════════════════════════════
 */

interface EquipmentEntry {
  id: string;          // "eq-NNN" 形式 (3桁ゼロ埋め)
  name: string;        // 装備名
  slot: EquipSlot;     // スロット → 下記参照
  effect: string;      // 効果説明 (UI表示用。例: "ATK+10 DEF+3")
  atkBonus: number;    // 攻撃力ボーナス (不要なら 0)
  defBonus: number;    // 防御力ボーナス (不要なら 0)
  spdBonus: number;    // 素早さボーナス (不要なら 0)
  sprite: string;      // 絵文字
  element?: MonsterType; // 属性付与 (省略可)
  // ── HP/MPボーナスはまだ未実装 ──
}

type EquipSlot = "weapon" | "armor" | "accessory";
type MonsterType = "水" | "地" | "光" | "炎" | "闇";

// ── ボーナス目安 ──────────────────────────────────────────────────────
//  下位装備: +2〜+6
//  中位装備: +7〜+14
//  上位装備: +15〜+25
//  最上位:   +26〜
//
//  weapon   → atkBonus メイン, defBonus/spdBonus は控えめ
//  armor    → defBonus メイン
//  accessory→ 複合ボーナスOK

// ── 記述例 ────────────────────────────────────────────────────────────
/*
  {
    id: "eq-044",
    name: "炎の大剣",
    slot: "weapon",
    effect: "ATK+18 炎属性",
    atkBonus: 18,
    defBonus: 0,
    spdBonus: -2,
    sprite: "🗡️",
    element: "炎",
  },
*/
