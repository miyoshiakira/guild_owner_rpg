/**
 * ════════════════════════════════════════════════════════════════════
 * MATERIAL MASTER — 新規追加用スキーマ定義ファイル
 *
 * 【Claudeへの指示】
 *   このファイルを読んで _pending/material.pending.ts に新規エントリを書いてください。
 *
 * 【次に使うID】
 *   mat-036
 *
 * 【マージ方法】
 *   node scripts/mergeMaster.mjs material
 * ════════════════════════════════════════════════════════════════════
 */

interface MaterialEntry {
  id: string;          // "mat-NNN" 形式 (3桁ゼロ埋め)
  name: string;        // 素材名
  emoji: string;       // 絵文字アイコン
  description: string; // 説明文 (30〜50字程度)
}

// ── 記述例 ────────────────────────────────────────────────────────────
/*
  { id: "mat-034", name: "砂の結晶", emoji: "⌛", description: "砂漠のモンスターが残した砂が凝固した結晶。乾燥した魔力を帯びている" },
*/
