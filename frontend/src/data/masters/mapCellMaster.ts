/**
 * マップセルデータ (タイルマップ用)
 * 各マップの 20x20 タイルグリッドを定義します
 * タイル種別:
 *   0=草原/空地  1=水辺/溶岩(通行不可)  2=森(通行不可)  3=岩場(通行不可)
 *   4=道        5=町/砦               6=ダンジョン    7=砂漠
 *   8=雪原      9=出口ポータル
 */

// CSVファイルをインポート
import map001Csv from '../maps/map-001.csv?raw';
import map002Csv from '../maps/map-002.csv?raw';
import map003Csv from '../maps/map-003.csv?raw';
import map004Csv from '../maps/map-004.csv?raw';
import map005Csv from '../maps/map-005.csv?raw';
import map006Csv from '../maps/map-006.csv?raw';
import map007Csv from '../maps/map-007.csv?raw';
import map008Csv from '../maps/map-008.csv?raw';
import map009Csv from '../maps/map-009.csv?raw';
import map010Csv from '../maps/map-010.csv?raw';
import map011Csv from '../maps/map-011.csv?raw';
import map012Csv from '../maps/map-012.csv?raw';
import map013Csv from '../maps/map-013.csv?raw';
import map014Csv from '../maps/map-014.csv?raw';
import map015Csv from '../maps/map-015.csv?raw';
import map016Csv from '../maps/map-016.csv?raw';
import map017Csv from '../maps/map-017.csv?raw';
import map018Csv from '../maps/map-018.csv?raw';
import map019Csv from '../maps/map-019.csv?raw';
// CSVの文字列を二次元配列に変換
function parseCsv(csv: string): number[][] {
  return csv.trim().split('\n').map(row =>
    row.split(',').map(cell => parseInt(cell.trim(), 10))
  );
}

// CSVからパースしたデータをエクスポート
export const MAP1_TILES: number[][] = parseCsv(map001Csv);
export const MAP2_TILES: number[][] = parseCsv(map002Csv);
export const MAP3_TILES: number[][] = parseCsv(map003Csv);
export const MAP4_TILES: number[][] = parseCsv(map004Csv);
export const MAP5_TILES: number[][] = parseCsv(map005Csv);
export const MAP6_TILES: number[][] = parseCsv(map006Csv);
export const MAP7_TILES: number[][] = parseCsv(map007Csv);
export const MAP8_TILES: number[][] = parseCsv(map008Csv);
export const MAP9_TILES: number[][] = parseCsv(map009Csv);
export const MAP10_TILES: number[][] = parseCsv(map010Csv);
export const MAP11_TILES: number[][] = parseCsv(map011Csv);
export const MAP12_TILES: number[][] = parseCsv(map012Csv);
export const MAP13_TILES: number[][] = parseCsv(map013Csv);
export const MAP14_TILES: number[][] = parseCsv(map014Csv);
export const MAP15_TILES: number[][] = parseCsv(map015Csv);
export const MAP16_TILES: number[][] = parseCsv(map016Csv);
export const MAP17_TILES: number[][] = parseCsv(map017Csv);
export const MAP18_TILES: number[][] = parseCsv(map018Csv);
export const MAP19_TILES: number[][] = parseCsv(map019Csv);