/**
 * ════════════════════════════════════════════════════════════════════
 * ITEM MASTER — 新規追加用スキーマ定義ファイル
 *
 * 【Claudeへの指示】
 *   このファイルを読んで _pending/item.pending.ts に新規エントリを書いてください。
 *
 * 【次に使うID】
 *   item-007
 *
 * 【マージ方法】
 *   node scripts/mergeMaster.mjs item
 * ════════════════════════════════════════════════════════════════════
 */

interface ItemEntry {
  id: string;    // "item-NNN" 形式
  name: string;  // アイテム名
  type: ItemType;
  effect: string; // 効果説明 (UI表示用)
  sprite: string; // 絵文字
}

type ItemType = "消耗品"; // 現在は消耗品のみ

// ── 記述例 ────────────────────────────────────────────────────────────
/*
  {
    id: "item-007",
    name: "速度の書",
    type: "消耗品",
    effect: "SPDを一時的に+5する",
    sprite: "📖",
  },
*/
