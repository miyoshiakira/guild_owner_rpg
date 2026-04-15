/**
 * BaseMapChip.png スプライトシート設定
 * 元サイズ: 32×32 px / タイル、8列 × 249行
 *
 * TILE_CHIP_POS[tileId] = [col, row] (0-indexed)
 * 実際の px 座標 = col * 32, row * 32
 *
 * ※ FieldPage の TILE_SIZE (48px) にスケーリングして描画する
 */

import { TileType } from "../masters/mapMaster";

export const CHIP_SHEET_COLS = 20;   // スプライトシートの横タイル数
export const CHIP_SRC_SIZE   = 100;  // 元スプライトの 1 タイルサイズ (px)

/**
 * マップタイルの定義（スプライトシート用）
 */
export interface MapTileConfig {
  id: number;
  name: string;
  chipPos: readonly [number, number];
  walkable: boolean; // 進行可能かどうか
  color?: string;    // デバッグ用の色
}

/**
 * マップタイルマスタ（互換性維持: 数値キー）
 */
export const MAP_TILE_MASTER: Record<number, MapTileConfig> = {
  0: { id: 0, name: "草原", chipPos: [0, 0], walkable: true, color: "rgb(149,187,31)" },
  1: { id: 1, name: "水", chipPos: [0, 3], walkable: false, color: "rgb(46,193,255)" },
  2: { id: 2, name: "森", chipPos: [0, 5], walkable: true, color: "rgb(39,97,29)" },
  3: { id: 3, name: "岩場", chipPos: [0, 4], walkable: false, color: "rgb(67,67,67)" },
  4: { id: 4, name: "道", chipPos: [0, 1], walkable: true, color: "rgb(168,147,87)" },
  5: { id: 5, name: "町", chipPos: [0, 6], walkable: true, color: "rgb(213,183,117)" },
  6: { id: 6, name: "ダンジョン", chipPos: [0, 1], walkable: true, color: "rgb(107,75,38)" },
  7: { id: 7, name: "砂漠", chipPos: [0, 8], walkable: true, color: "rgb(248,215,129)" },
  8: { id: 8, name: "雪原", chipPos: [0, 2], walkable: true, color: "rgb(235,235,237)" },
  9: { id: 9, name: "出口ポータル", chipPos: [0, 7], walkable: true, color: "rgb(138,118,210)" },
};

/**
 * マップタイルマスタ（TileType enumキー版）
 * 新規コードではこちらを使用してください
 */
export const MAP_TILE_MASTER_BY_TYPE: Record<TileType, MapTileConfig> = {
  [TileType.GRASS]: MAP_TILE_MASTER[0],
  [TileType.WATER]: MAP_TILE_MASTER[1],
  [TileType.FOREST]: MAP_TILE_MASTER[2],
  [TileType.ROCK]: MAP_TILE_MASTER[3],
  [TileType.ROAD]: MAP_TILE_MASTER[4],
  [TileType.TOWN]: MAP_TILE_MASTER[5],
  [TileType.DUNGEON]: MAP_TILE_MASTER[6],
  [TileType.DESERT]: MAP_TILE_MASTER[7],
  [TileType.SNOW]: MAP_TILE_MASTER[8],
  [TileType.PORTAL]: MAP_TILE_MASTER[9],
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
