import { memo, useRef, useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Typography, Box, Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MAP_MASTER } from "../data/masters/mapMaster";

// ── レイアウト定数 ───────────────────────────────────────────────────────
const NODE_W = 88;
const NODE_H = 48;
const CANVAS_W = 620;
const CANVAS_H = 620;

// 各マップノードの中心座標
const NODE_POS: Record<string, { x: number; y: number }> = {
  "map-001": { x: 260, y: 300 },
  "map-002": { x: 380, y: 300 },
  "map-003": { x: 260, y: 210 },
  "map-004": { x: 150, y: 300 },
  "map-005": { x: 260, y: 390 },
  "map-006": { x: 260, y: 120 },
  "map-007": { x: 500, y: 300 },
  "map-008": { x:  60, y: 390 },
  "map-009": { x: 260, y:  35 },
  "map-010": { x: 500, y: 390 },
  "map-011": { x: 150, y: 390 },
  "map-012": { x: 380, y: 210 },
  "map-013": { x: 260, y: 480 },
  "map-014": { x:  60, y: 490 },
  "map-015": { x: 130, y:   35 },
  "map-016": { x: 500, y: 490 },
  "map-017": { x: 150, y: 490 },
  "map-018": { x: 380, y: 120 },
};

// 表示するエッジ（双方向、重複なし）
const EDGES: [string, string][] = [
  ["map-001", "map-002"],
  ["map-001", "map-003"],
  ["map-001", "map-004"],
  ["map-001", "map-005"],
  ["map-001", "map-008"],
  ["map-002", "map-007"],
  ["map-003", "map-006"],
  ["map-003", "map-012"],
  ["map-004", "map-011"],
  ["map-005", "map-013"],
  ["map-006", "map-009"],
  ["map-007", "map-010"],
  ["map-008", "map-014"],
  ["map-009", "map-015"],
  ["map-010", "map-016"],
  ["map-011", "map-017"],
  ["map-012", "map-018"],
];

// マップIDからレベル帯文字列を生成
function levelRange(mapId: string): string {
  const m = MAP_MASTER.find((d) => d.id === mapId);
  if (!m) return "";
  return `Lv${m.baseLevel}〜${m.baseLevel + m.levelVariance}`;
}

// ノードの塗りつぶし色
const NODE_COLORS: Record<string, string> = {
  "map-001": "#2d6a3f",
  "map-002": "#7a5e1a",
  "map-003": "#2a5a8a",
  "map-004": "#1e4d2a",
  "map-005": "#8a2e18",
  "map-006": "#4a3a7a",
  "map-007": "#2a1a4a",
  "map-008": "#1a4a6a",
  "map-009": "#5a3a8a",
  "map-010": "#4a0a1a",
  "map-011": "#2a4a1a",
  "map-012": "#2a4a7a",
  "map-013": "#6a2a10",
  "map-014": "#0a2a5a",
  "map-015": "#6a5a1a",
  "map-016": "#1a0a2a",
  "map-017": "#3a3a1a",
  "map-018": "#1a3a5a",
};

interface WarpTarget {
  id: string;
  name: string;
  emoji: string;
}

interface WorldMapModalProps {
  open: boolean;
  onClose: () => void;
  currentMapId: string;
  visitedMapIds: string[];
  onWarp: (mapId: string) => void;
}

const WorldMapModal = memo(function WorldMapModal({
  open, onClose, currentMapId, visitedMapIds, onWarp,
}: WorldMapModalProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [warpTarget, setWarpTarget] = useState<WarpTarget | null>(null);

  // ダイアログが開いたときスクロールをリセット
  useEffect(() => {
    if (open && containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  }, [open]);

  const mapDataMap = Object.fromEntries(MAP_MASTER.map((m) => [m.id, m]));

  const handleNodeClick = (mapId: string) => {
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

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "#0d0d1a",
            border: "1px solid rgba(124,77,255,0.4)",
            borderRadius: 2,
            m: { xs: 1, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ pb: 0.5, pr: 6, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 700 }}>
            🗺️ ワールドマップ
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
            現在地: {mapDataMap[currentMapId]?.emoji} {mapDataMap[currentMapId]?.name}
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          ref={containerRef}
          sx={{ p: 1.5, overflowX: "auto", overflowY: "auto" }}
        >
          {/* スケーラブルなSVG＋ノード合成レイヤー */}
          <Box
            sx={{
              position: "relative",
              width: CANVAS_W,
              height: CANVAS_H,
              mx: "auto",
              maxWidth: "100%",
              transform: "scale(1)",
              transformOrigin: "top left",
            }}
          >
            {/* SVG: エッジ（接続線） */}
            <svg
              ref={svgRef}
              width={CANVAS_W}
              height={CANVAS_H}
              style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L0,6 L6,3 z" fill="rgba(124,77,255,0.6)" />
                </marker>
              </defs>
              {EDGES.map(([a, b]) => {
                const pa = NODE_POS[a];
                const pb = NODE_POS[b];
                if (!pa || !pb) return null;
                const isActive = a === currentMapId || b === currentMapId;
                return (
                  <line
                    key={`${a}-${b}`}
                    x1={pa.x} y1={pa.y}
                    x2={pb.x} y2={pb.y}
                    stroke={isActive ? "rgba(255,215,64,0.8)" : "rgba(124,77,255,0.45)"}
                    strokeWidth={isActive ? 2.5 : 1.5}
                    strokeDasharray={isActive ? "none" : "5,3"}
                  />
                );
              })}
            </svg>

            {/* ノード（各マップ） */}
            {Object.entries(NODE_POS).map(([mapId, { x, y }]) => {
              const data = mapDataMap[mapId];
              if (!data) return null;
              const isCurrent = mapId === currentMapId;
              const isVisited = visitedMapIds.includes(mapId);
              const isWarpable = isVisited && !isCurrent;

              return (
                <Box
                  key={mapId}
                  onClick={() => handleNodeClick(mapId)}
                  sx={{
                    position: "absolute",
                    left: x - NODE_W / 2,
                    top: y - NODE_H / 2,
                    width: NODE_W,
                    height: NODE_H,
                    bgcolor: isCurrent
                      ? "rgba(255,215,64,0.22)"
                      : `${NODE_COLORS[mapId] ?? "#2a2a4a"}cc`,
                    border: isCurrent
                      ? "2px solid #ffd740"
                      : isWarpable
                        ? "1px solid rgba(100,200,255,0.6)"
                        : "1px solid rgba(180,140,255,0.35)",
                    borderRadius: 1.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0,
                    opacity: isVisited ? 1 : 0.38,
                    boxShadow: isCurrent
                      ? "0 0 12px rgba(255,215,64,0.5)"
                      : isWarpable
                        ? "0 0 8px rgba(100,200,255,0.25)"
                        : "0 2px 8px rgba(0,0,0,0.4)",
                    cursor: isWarpable ? "pointer" : "default",
                    transition: "box-shadow 0.2s, border-color 0.2s, opacity 0.2s",
                    overflow: "hidden",
                    px: 0.5,
                    "&:hover": isWarpable ? {
                      boxShadow: "0 0 16px rgba(100,200,255,0.55)",
                      border: "1px solid rgba(100,200,255,0.9)",
                    } : {},
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 10,
                      fontWeight: isCurrent ? 800 : 600,
                      color: isCurrent ? "#ffd740" : isVisited ? "rgba(255,255,255,0.92)" : "rgba(200,200,200,0.5)",
                      lineHeight: 1.2,
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      width: "100%",
                    }}
                  >
                    {isVisited ? `${data.emoji} ${data.name}` : "？？？"}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 9,
                      color: isCurrent ? "rgba(255,215,64,0.8)" : "rgba(180,180,255,0.65)",
                      lineHeight: 1.2,
                    }}
                  >
                    {isVisited ? levelRange(mapId) : ""}
                  </Typography>
                  {isCurrent && (
                    <Typography
                      sx={{
                        fontSize: 8,
                        color: "#ffd740",
                        fontWeight: 700,
                        lineHeight: 1,
                        mt: 0.25,
                      }}
                    >
                      ▶ 現在地
                    </Typography>
                  )}
                  {isWarpable && (
                    <Typography
                      sx={{
                        fontSize: 8,
                        color: "rgba(100,200,255,0.85)",
                        fontWeight: 700,
                        lineHeight: 1,
                        mt: 0.25,
                      }}
                    >
                      🌀 ワープ可
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* 凡例 */}
          <Box sx={{ mt: 1.5, display: "flex", flexWrap: "wrap", gap: 1.5, justifyContent: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 20, height: 3, bgcolor: "rgba(255,215,64,0.8)", borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                現在地の接続
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 20, height: 2, bgcolor: "rgba(124,77,255,0.45)", borderRadius: 1,
                backgroundImage: "repeating-linear-gradient(90deg,rgba(124,77,255,0.45) 0,rgba(124,77,255,0.45) 5px,transparent 5px,transparent 8px)" }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                マップ間接続
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 14, height: 14, bgcolor: "rgba(255,215,64,0.22)", border: "1.5px solid #ffd740", borderRadius: 0.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                現在地
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 14, height: 14, bgcolor: "rgba(30,30,60,0.8)", border: "1px solid rgba(100,200,255,0.6)", borderRadius: 0.5 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                ワープ可能
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 14, height: 14, bgcolor: "rgba(30,30,60,0.3)", border: "1px solid rgba(180,140,255,0.2)", borderRadius: 0.5, opacity: 0.4 }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                未訪問
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* ワープ確認ダイアログ */}
      <Dialog
        open={!!warpTarget}
        onClose={() => setWarpTarget(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            border: "1px solid rgba(100,200,255,0.4)",
            borderRadius: 2,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          🌀 ワープ確認
        </DialogTitle>
        <DialogContent sx={{ pt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
              {warpTarget?.emoji} {warpTarget?.name}
            </Box>
            {" "}へワープしますか？
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            マップの入口（デフォルト地点）に移動します。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
          <Button onClick={() => setWarpTarget(null)} sx={{ color: "text.secondary" }}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ fontWeight: 700 }}
            onClick={handleWarpConfirm}
          >
            ワープする
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
});

export default WorldMapModal;
