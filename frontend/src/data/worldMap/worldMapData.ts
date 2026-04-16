import regionMasterJson from './regionMaster.json';
import worldLayoutJson from './worldLayout.json';
import regionLayoutsJson from './regionLayouts.json';
import { MAP_MASTER } from '../masters/mapMaster';

// ── 型定義 ─────────────────────────────────────────────────────────────────

export interface RegionData {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  mapIds: string[];
}

/** グラフのノード（地域またはマップ）の位置 */
export interface NodePos {
  id: string;
  x: number;
  y: number;
}

/** グラフのレイアウト（ノード位置のみ、エッジはトランジションから導出） */
export interface GraphLayout {
  nodes: NodePos[];
}

// ── JSONからエクスポート ────────────────────────────────────────────────────

export const REGION_MASTER: RegionData[] = regionMasterJson as RegionData[];

export const WORLD_LAYOUT: GraphLayout = worldLayoutJson as GraphLayout;

export const REGION_LAYOUTS: Record<string, GraphLayout> =
  regionLayoutsJson as Record<string, GraphLayout>;

// ── ヘルパー ───────────────────────────────────────────────────────────────

/** mapId から所属地域を返す */
export function getRegionForMap(mapId: string): RegionData | undefined {
  return REGION_MASTER.find(r => r.mapIds.includes(mapId));
}

/** 地域 ID のインデックスマップ */
export const REGION_MAP: Record<string, RegionData> = Object.fromEntries(
  REGION_MASTER.map(r => [r.id, r])
);

/**
 * 指定地域内のマップ間エッジを MapTransition から導出する。
 * showOnWorldMap が false のトランジションは除外する。
 */
export function deriveEdgesFromTransitions(mapIds: string[]): [string, string][] {
  const mapIdSet = new Set(mapIds);
  const seen = new Set<string>();
  const edges: [string, string][] = [];
  MAP_MASTER
    .filter(m => mapIdSet.has(m.id))
    .forEach(m => {
      m.transitions
        .filter(t => t.showOnWorldMap !== false && mapIdSet.has(t.toMapId))
        .forEach(t => {
          const key = [m.id, t.toMapId].sort().join("||");
          if (!seen.has(key)) {
            seen.add(key);
            edges.push([m.id, t.toMapId]);
          }
        });
    });
  return edges;
}

/**
 * 地域間のエッジをマップ間トランジションから導出する。
 * 異なる地域間をまたぐトランジション（showOnWorldMap !== false）を集約する。
 */
export function deriveWorldEdges(): [string, string][] {
  const mapToRegion: Record<string, string> = {};
  REGION_MASTER.forEach(r => r.mapIds.forEach(mid => { mapToRegion[mid] = r.id; }));
  const seen = new Set<string>();
  const edges: [string, string][] = [];
  MAP_MASTER.forEach(m => {
    const fromRegion = mapToRegion[m.id];
    if (!fromRegion) return;
    m.transitions
      .filter(t => t.showOnWorldMap !== false)
      .forEach(t => {
        const toRegion = mapToRegion[t.toMapId];
        if (!toRegion || toRegion === fromRegion) return;
        const key = [fromRegion, toRegion].sort().join("||");
        if (!seen.has(key)) {
          seen.add(key);
          edges.push([fromRegion, toRegion]);
        }
      });
  });
  return edges;
}
