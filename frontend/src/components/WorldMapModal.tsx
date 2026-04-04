import { memo, useRef, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, IconButton, Typography, Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MAP_MASTER } from "../data/masters/mapMaster";

// ── レイアウト定数 ───────────────────────────────────────────────────────
const NODE_W = 88;
const NODE_H = 48;
const CANVAS_W = 520;
const CANVAS_H = 510;

// 各マップノードの中心座標
const NODE_POS: Record<string, { x: number; y: number }> = {
  "map-001": { x: 260, y: 280 },
  "map-002": { x: 370, y: 280 },
  "map-003": { x: 260, y: 195 },
  "map-004": { x: 150, y: 280 },
  "map-005": { x: 260, y: 365 },
  "map-006": { x: 260, y: 110 },
  "map-007": { x: 480, y: 280 },
  "map-008": { x:  70, y: 365 },
  "map-009": { x: 260, y:  25 },
  "map-010": { x: 480, y: 365 },
  "map-011": { x: 150, y: 365 },
  "map-012": { x: 370, y: 195 },
  "map-013": { x: 260, y: 450 },
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
};

interface WorldMapModalProps {
  open: boolean;
  onClose: () => void;
  currentMapId: string;
}

const WorldMapModal = memo(function WorldMapModal({
  open, onClose, currentMapId,
}: WorldMapModalProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ダイアログが開いたときスクロールをリセット
  useEffect(() => {
    if (open && containerRef.current) {
      containerRef.current.scrollTop = 0;
      containerRef.current.scrollLeft = 0;
    }
  }, [open]);

  const mapDataMap = Object.fromEntries(MAP_MASTER.map((m) => [m.id, m]));

  return (
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
            // 画面幅に収まるよう縮小（最大等倍）
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
            return (
              <Box
                key={mapId}
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
                    : "1px solid rgba(180,140,255,0.35)",
                  borderRadius: 1.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0,
                  boxShadow: isCurrent
                    ? "0 0 12px rgba(255,215,64,0.5)"
                    : "0 2px 8px rgba(0,0,0,0.4)",
                  transition: "box-shadow 0.2s",
                  overflow: "hidden",
                  px: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: isCurrent ? 800 : 600,
                    color: isCurrent ? "#ffd740" : "rgba(255,255,255,0.92)",
                    lineHeight: 1.2,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                  }}
                >
                  {data.emoji} {data.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 9,
                    color: isCurrent ? "rgba(255,215,64,0.8)" : "rgba(180,180,255,0.65)",
                    lineHeight: 1.2,
                  }}
                >
                  {levelRange(mapId)}
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
        </Box>
      </DialogContent>
    </Dialog>
  );
});

export default WorldMapModal;
