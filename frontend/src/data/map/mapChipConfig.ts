/**
 * BaseMapChip.png スプライトシート設定
 * 元サイズ: 32×32 px / タイル、8列 × 249行
 *
 * TILE_CHIP_POS[tileId] = [col, row] (0-indexed)
 * 実際の px 座標 = col * 32, row * 32
 *
 * ※ FieldPage の TILE_SIZE (48px) にスケーリングして描画する
 */

export const CHIP_SHEET_COLS = 20;   // スプライトシートの横タイル数
export const CHIP_SRC_SIZE   = 100;  // 元スプライトの 1 タイルサイズ (px)

/**
 * マップタイルの種類
 */
export type MapTileType =
  | "grassland"   // 草原
  | "water"       // 水
  | "forest"      // 森
  | "rock"        // 岩場
  | "road"        // 道
  | "town"        // 町
  | "dungeon"     // ダンジョン
  | "desert"      // 砂漠
  | "snow"        // 雪原
  | "portal";     // 出口ポータル

/**
 * マップタイルの定義
 */
export interface MapTileConfig {
  id: number;
  type: MapTileType;
  name: string;
  chipPos: readonly [number, number];
  walkable: boolean; // 進行可能かどうか
  color?: string;    // デバッグ用の色
}

/**
 * マップタイルマスタ
 */
export const MAP_TILE_MASTER: Record<number, MapTileConfig> = {
  0: { id: 0, type: "grassland", name: "草原", chipPos: [0, 0], walkable: true, color: "rgb(149,187,31)" },
  1: { id: 1, type: "water", name: "水", chipPos: [0, 3], walkable: false, color: "rgb(46,193,255)" },
  2: { id: 2, type: "forest", name: "森", chipPos: [0, 5], walkable: true, color: "rgb(39,97,29)" },
  3: { id: 3, type: "rock", name: "岩場", chipPos: [0, 4], walkable: false, color: "rgb(67,67,67)" },
  4: { id: 4, type: "road", name: "道", chipPos: [0, 1], walkable: true, color: "rgb(168,147,87)" },
  5: { id: 5, type: "town", name: "町", chipPos: [0, 6], walkable: true, color: "rgb(213,183,117)" },
  6: { id: 6, type: "dungeon", name: "ダンジョン", chipPos: [0, 1], walkable: true, color: "rgb(107,75,38)" },
  7: { id: 7, type: "desert", name: "砂漠", chipPos: [0, 8], walkable: true, color: "rgb(248,215,129)" },
  8: { id: 8, type: "snow", name: "雪原", chipPos: [0, 2], walkable: true, color: "rgb(235,235,237)" },
  9: { id: 9, type: "portal", name: "出口ポータル", chipPos: [0, 7], walkable: true, color: "rgb(138,118,210)" },
};

/**
 * ゲームタイル番号 → スプライトシート座標 [col, row] (互換性のため残す)
 * @deprecated MAP_TILE_MASTERを使用してください
 */
export const TILE_CHIP_POS: Record<number, readonly [number, number]> = {
  0: [0, 0],   // 草原     rgb(149,187,31) 明るい緑の草地
  1: [0, 3],   // 水       rgb(46,193,255)  青い水面
  2: [0, 5],   // 森       rgb(39,97,29)    濃い緑の樹林
  3: [0, 4],  // 岩場     rgb(67,67,67)    グレーの岩
  4: [0, 1],  // 道       rgb(168,147,87)  ベージュの砂道
  5: [0, 6],  // 町       rgb(213,183,117) 黄土色の石畳
  6: [0, 1],   // ダンジョン rgb(107,75,38) 暗い石床
  7: [0, 8],  // 砂漠     rgb(248,215,129) 砂色
  8: [0, 2],  // 雪原     rgb(235,235,237) 雪白色
  9: [0, 7],  // 出口     rgb(138,118,210) 紫の魔法陣
} as const;

/**
 * タイルが進行可能かどうかをチェック
 */
export function isTileWalkable(tileId: number): boolean {
  return MAP_TILE_MASTER[tileId]?.walkable ?? false;
}
