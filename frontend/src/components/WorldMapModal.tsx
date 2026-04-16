import { memo, useRef, useEffect, useState, useMemo } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Typography, Box, Button, Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { MAP_MASTER } from "../data/masters/mapMaster";
import {
  REGION_MASTER, WORLD_LAYOUT, REGION_LAYOUTS,
  deriveEdgesFromTransitions, deriveWorldEdges,
  type RegionData, type NodePos,
} from "../data/worldMap/worldMapData";

// ── レイアウト定数 ───────────────────────────────────────────────────────
const CANVAS_W = 560;
const CANVAS_H = 540;
// ワールドビュー: 地域ノード
const RNODE_W = 110;
const RNODE_H = 58;
// 地域ビュー: マップノード
const MNODE_W = 92;
const MNODE_H = 50;

// マップIDからレベル帯文字列を生成
function levelRange(mapId: string): string {
  const m = MAP_MASTER.find(d => d.id === mapId);
  if (!m) return "";
  return `Lv${m.baseLevel}〜${m.baseLevel + m.levelVariance}`;
}

// マップノードの色（地域の色をベースに派生）
const MAP_NODE_COLORS: Record<string, string> = {
  "map-001": "#2d6a3f", "map-002": "#7a5e1a", "map-003": "#2a5a8a",
  "map-004": "#1e4d2a", "map-005": "#8a2e18", "map-006": "#4a3a7a",
  "map-007": "#2a1a4a", "map-008": "#1a4a6a", "map-009": "#5a3a8a",
  "map-010": "#4a0a1a", "map-011": "#2a4a1a", "map-012": "#2a4a7a",
  "map-013": "#6a2a10", "map-014": "#0a2a5a", "map-015": "#6a5a1a",
  "map-016": "#1a0a2a", "map-017": "#3a3a1a", "map-018": "#1a3a5a",
};

// ── SVGエッジ ─────────────────────────────────────────────────────────────
function EdgeLayer({
  nodes, edges, activeId, nodeW, nodeH,
}: {
  nodes: NodePos[];
  edges: [string, string][];
  activeId: string;
  nodeW: number;
  nodeH: number;
}) {
  const posMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  return (
    <svg
      width={CANVAS_W} height={CANVAS_H}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {edges.map(([a, b]) => {
        const pa = posMap[a], pb = posMap[b];
        if (!pa || !pb) return null;
        const isActive = a === activeId || b === activeId;
        return (
          <line key={`${a}-${b}`}
            x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
            stroke={isActive ? "rgba(255,215,64,0.8)" : "rgba(124,77,255,0.45)"}
            strokeWidth={isActive ? 2.5 : 1.5}
            strokeDasharray={isActive ? undefined : "5,3"}
          />
        );
      })}
    </svg>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────
interface WorldMapModalProps {
  open: boolean;
  onClose: () => void;
  currentMapId: string;
  visitedMapIds: string[];
  onWarp: (mapId: string) => void;
}

interface WarpTarget { id: string; name: string; emoji: string; }

// ── メインコンポーネント ──────────────────────────────────────────────────
const WorldMapModal = memo(function WorldMapModal({
  open, onClose, currentMapId, visitedMapIds, onWarp,
}: WorldMapModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewLevel, setViewLevel] = useState<"world" | "region">("world");
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [warpTarget, setWarpTarget] = useState<WarpTarget | null>(null);

  // ダイアログを開くたびに現在地の地域ビューへ初期化
  useEffect(() => {
    if (open) {
      setWarpTarget(null);
      // 現在地の地域を特定して地域ビューで開く
      const region = REGION_MASTER.find(r => r.mapIds.includes(currentMapId));
      if (region) {
        setViewLevel("region");
        setActiveRegionId(region.id);
      } else {
        setViewLevel("world");
        setActiveRegionId(null);
      }
      containerRef.current?.scrollTo(0, 0);
    }
  }, [open, currentMapId]);

  const mapDataMap = useMemo(
    () => Object.fromEntries(MAP_MASTER.map(m => [m.id, m])),
    []
  );

  // 現在いる地域
  const currentRegion = useMemo(
    () => REGION_MASTER.find(r => r.mapIds.includes(currentMapId)),
    [currentMapId]
  );

  // 地域が「訪問済み」か（1マップでも訪問済みなら訪問済み）
  const isRegionVisited = (r: RegionData) =>
    r.mapIds.some(id => visitedMapIds.includes(id));

  // 地域内の訪問済みマップ数
  const visitedCount = (r: RegionData) =>
    r.mapIds.filter(id => visitedMapIds.includes(id)).length;

  // ── ワールドビュー: 地域クリック ─────────────────────────────────────
  const handleRegionClick = (regionId: string) => {
    if (!isRegionVisited(REGION_MASTER.find(r => r.id === regionId)!)) return;
    setViewLevel("region");
    setActiveRegionId(regionId);
  };

  // ── 地域ビュー: マップクリック ───────────────────────────────────────
  const handleMapClick = (mapId: string) => {
    if (mapId === currentMapId) return;
    if (!visitedMapIds.includes(mapId)) return;
    const data = mapDataMap[mapId];
    if (!data) return;
    setWarpTarget({ id: mapId, name: data.name, emoji: data.emoji });
  };

  const handleWarpConfirm = () => {
    if (!warpTarget) return;
    onWarp(warpTarget.id);
    setWarpTarget(null);
  };

  const goToWorld = () => {
    setViewLevel("world");
    setActiveRegionId(null);
  };

  // ── 地域ビューのデータ ────────────────────────────────────────────────
  const activeRegion = activeRegionId ? REGION_MASTER.find(r => r.id === activeRegionId) : null;
  const regionLayout = activeRegionId ? REGION_LAYOUTS[activeRegionId] : null;
  const worldEdges = useMemo(() => deriveWorldEdges(), []);
  const regionEdges = useMemo(
    () => activeRegion ? deriveEdgesFromTransitions(activeRegion.mapIds) : [],
    [activeRegion]
  );

  // ── レンダリング ─────────────────────────────────────────────────────
  return (
    <>
      <Dialog
        open={open} onClose={onClose} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: "#0d0d1a", border: "1px solid rgba(124,77,255,0.4)", borderRadius: 2, m: { xs: 1, sm: 2 } } }}
      >
        {/* ── ヘッダー ── */}
        <DialogTitle sx={{ pb: 0.5, pr: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            {/* ブレッドクラム */}
            {viewLevel === "region" ? (
              <>
                <Button size="small" startIcon={<ArrowBackIcon fontSize="small" />}
                  onClick={goToWorld} sx={{ color: "#aaa", fontSize: 11, py: 0, minWidth: 0 }}>
                  世界
                </Button>
                <Typography sx={{ color: "#555", fontSize: 12 }}>›</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
                  {activeRegion?.emoji} {activeRegion?.name}
                </Typography>
              </>
            ) : (
              <Typography variant="h6" sx={{ fontSize: 15, fontWeight: 700 }}>
                🗺️ ワールドマップ
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary" sx={{ ml: "auto", mr: 3 }}>
              現在地: {mapDataMap[currentMapId]?.emoji} {mapDataMap[currentMapId]?.name}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small"
            sx={{ position: "absolute", right: 8, top: 8 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent ref={containerRef} sx={{ p: 1.5, overflowX: "auto", overflowY: "auto" }}>
          <Box sx={{ position: "relative", width: CANVAS_W, height: CANVAS_H, mx: "auto", maxWidth: "100%" }}>

            {/* ══ ワールドビュー ══ */}
            {viewLevel === "world" && (
              <>
                <EdgeLayer
                  nodes={WORLD_LAYOUT.nodes}
                  edges={worldEdges}
                  activeId={currentRegion?.id ?? ""}
                  nodeW={RNODE_W} nodeH={RNODE_H}
                />
                {WORLD_LAYOUT.nodes.map(({ id, x, y }) => {
                  const region = REGION_MASTER.find(r => r.id === id);
                  if (!region) return null;
                  const isCurrent = id === currentRegion?.id;
                  const visited = isRegionVisited(region);
                  const vc = visitedCount(region);
                  return (
                    <Box key={id}
                      onClick={() => handleRegionClick(id)}
                      sx={{
                        position: "absolute",
                        left: x - RNODE_W / 2, top: y - RNODE_H / 2,
                        width: RNODE_W, height: RNODE_H,
                        bgcolor: isCurrent
                          ? "rgba(255,215,64,0.18)"
                          : `${region.color}cc`,
                        border: isCurrent
                          ? "2px solid #ffd740"
                          : visited
                            ? "1px solid rgba(124,77,255,0.6)"
                            : "1px solid rgba(100,100,150,0.3)",
                        borderRadius: 1.5,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        opacity: visited ? 1 : 0.35,
                        cursor: visited ? "pointer" : "default",
                        boxShadow: isCurrent
                          ? "0 0 14px rgba(255,215,64,0.45)"
                          : visited ? "0 0 8px rgba(124,77,255,0.25)" : "none",
                        transition: "all 0.15s",
                        px: 0.5,
                        "&:hover": visited ? {
                          boxShadow: "0 0 16px rgba(124,77,255,0.5)",
                          border: "1.5px solid rgba(124,77,255,0.9)",
                        } : {},
                      }}
                    >
                      <Typography sx={{ fontSize: 16, lineHeight: 1 }}>
                        {visited ? region.emoji : "❓"}
                      </Typography>
                      <Typography sx={{
                        fontSize: 10, fontWeight: isCurrent ? 800 : 600,
                        color: isCurrent ? "#ffd740" : "rgba(255,255,255,0.9)",
                        textAlign: "center", lineHeight: 1.3, mt: 0.25,
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%",
                      }}>
                        {visited ? region.name : "未探索"}
                      </Typography>
                      {visited && (
                        <Typography sx={{ fontSize: 9, color: isCurrent ? "rgba(255,215,64,0.8)" : "rgba(180,180,255,0.65)" }}>
                          {vc}/{region.mapIds.length}マップ
                        </Typography>
                      )}
                      {isCurrent && (
                        <Typography sx={{ fontSize: 8, color: "#ffd740", fontWeight: 700, lineHeight: 1 }}>
                          ▶ 現在地
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </>
            )}

            {/* ══ 地域ビュー ══ */}
            {viewLevel === "region" && activeRegion && regionLayout && (
              <>
                <EdgeLayer
                  nodes={regionLayout.nodes}
                  edges={regionEdges}
                  activeId={currentMapId}
                  nodeW={MNODE_W} nodeH={MNODE_H}
                />
                {regionLayout.nodes.map(({ id: mapId, x, y }) => {
                  const data = mapDataMap[mapId];
                  if (!data) return null;
                  const isCurrent = mapId === currentMapId;
                  const isVisited = visitedMapIds.includes(mapId);
                  const isWarpable = isVisited && !isCurrent;
                  return (
                    <Box key={mapId}
                      onClick={() => handleMapClick(mapId)}
                      sx={{
                        position: "absolute",
                        left: x - MNODE_W / 2, top: y - MNODE_H / 2,
                        width: MNODE_W, height: MNODE_H,
                        bgcolor: isCurrent
                          ? "rgba(255,215,64,0.22)"
                          : `${MAP_NODE_COLORS[mapId] ?? "#2a2a4a"}cc`,
                        border: isCurrent
                          ? "2px solid #ffd740"
                          : isWarpable
                            ? "1px solid rgba(100,200,255,0.6)"
                            : "1px solid rgba(180,140,255,0.35)",
                        borderRadius: 1.5,
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center",
                        opacity: isVisited ? 1 : 0.38,
                        cursor: isWarpable ? "pointer" : "default",
                        boxShadow: isCurrent
                          ? "0 0 12px rgba(255,215,64,0.5)"
                          : isWarpable ? "0 0 8px rgba(100,200,255,0.25)" : "0 2px 8px rgba(0,0,0,0.4)",
                        transition: "all 0.15s",
                        px: 0.5,
                        "&:hover": isWarpable ? {
                          boxShadow: "0 0 16px rgba(100,200,255,0.55)",
                          border: "1px solid rgba(100,200,255,0.9)",
                        } : {},
                      }}
                    >
                      <Typography sx={{
                        fontSize: 10, fontWeight: isCurrent ? 800 : 600,
                        color: isCurrent ? "#ffd740" : isVisited ? "rgba(255,255,255,0.92)" : "rgba(200,200,200,0.5)",
                        lineHeight: 1.2, textAlign: "center",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%",
                      }}>
                        {isVisited ? `${data.emoji} ${data.name}` : "？？？"}
                      </Typography>
                      <Typography sx={{ fontSize: 9, color: isCurrent ? "rgba(255,215,64,0.8)" : "rgba(180,180,255,0.65)", lineHeight: 1.2 }}>
                        {isVisited ? levelRange(mapId) : ""}
                      </Typography>
                      {isCurrent && <Typography sx={{ fontSize: 8, color: "#ffd740", fontWeight: 700, lineHeight: 1, mt: 0.25 }}>▶ 現在地</Typography>}
                      {isWarpable && <Typography sx={{ fontSize: 8, color: "rgba(100,200,255,0.85)", fontWeight: 700, lineHeight: 1, mt: 0.25 }}>🌀 ワープ可</Typography>}
                    </Box>
                  );
                })}
              </>
            )}
          </Box>

          {/* 凡例 */}
          <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "center" }}>
            {viewLevel === "world" ? (
              <>
                <LegendItem color="rgba(255,215,64,0.18)" border="2px solid #ffd740" label="現在地の地域" />
                <LegendItem color="rgba(40,40,80,0.8)" border="1px solid rgba(124,77,255,0.6)" label="訪問済み" />
                <LegendItem color="rgba(30,30,60,0.3)" border="1px solid rgba(100,100,150,0.3)" opacity={0.4} label="未探索" />
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>クリックで地域に入る</Typography>
                </Box>
              </>
            ) : (
              <>
                <LegendItem color="rgba(255,215,64,0.22)" border="2px solid #ffd740" label="現在地" />
                <LegendItem color="rgba(30,30,60,0.8)" border="1px solid rgba(100,200,255,0.6)" label="ワープ可能" />
                <LegendItem color="rgba(30,30,60,0.3)" border="1px solid rgba(180,140,255,0.35)" opacity={0.4} label="未訪問" />
              </>
            )}
          </Box>

          {/* 地域一覧（ワールドビュー下部） */}
          {viewLevel === "world" && (
            <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
              {REGION_MASTER.map(r => {
                const visited = isRegionVisited(r);
                const vc = visitedCount(r);
                const isCurrent = r.id === currentRegion?.id;
                return (
                  <Chip key={r.id}
                    label={`${visited ? r.emoji : "❓"} ${visited ? r.name : "未探索"} ${visited ? `(${vc}/${r.mapIds.length})` : ""}`}
                    size="small"
                    onClick={() => visited ? handleRegionClick(r.id) : undefined}
                    sx={{
                      fontSize: 10, cursor: visited ? "pointer" : "default",
                      bgcolor: isCurrent ? "rgba(255,215,64,0.15)" : "rgba(40,40,80,0.6)",
                      border: isCurrent ? "1px solid rgba(255,215,64,0.5)" : "1px solid rgba(124,77,255,0.3)",
                      color: isCurrent ? "#ffd740" : visited ? "#ddd" : "#666",
                      opacity: visited ? 1 : 0.5,
                    }}
                  />
                );
              })}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* ワープ確認ダイアログ */}
      <Dialog open={!!warpTarget} onClose={() => setWarpTarget(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: "background.paper", border: "1px solid rgba(100,200,255,0.4)", borderRadius: 2, backgroundImage: "none" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>🌀 ワープ確認</DialogTitle>
        <DialogContent sx={{ pt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
              {warpTarget?.emoji} {warpTarget?.name}
            </Box>{" "}へワープしますか？
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            マップの入口（デフォルト地点）に移動します。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
          <Button onClick={() => setWarpTarget(null)} sx={{ color: "text.secondary" }}>キャンセル</Button>
          <Button variant="contained" color="primary" sx={{ fontWeight: 700 }} onClick={handleWarpConfirm}>
            ワープする
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

// ── 凡例アイテム ─────────────────────────────────────────────────────────
function LegendItem({ color, border, label, opacity = 1 }: {
  color: string; border: string; label: string; opacity?: number;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box sx={{ width: 14, height: 14, bgcolor: color, border, borderRadius: 0.5, opacity }} />
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{label}</Typography>
    </Box>
  );
}

export default WorldMapModal;
