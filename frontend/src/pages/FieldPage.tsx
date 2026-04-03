import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Card, CardContent, Typography, Chip, Button, useMediaQuery, useTheme } from "@mui/material";
import { useGame } from "../store/gameStore";
import { TILE_MAP, TILE_COLORS, TILE_SYMBOLS, ENEMY_SPAWN_TILES } from "../data/testData";
import { ENEMY_MASTER } from "../data/masters/enemyMaster";
import { loadGameData, saveGameData } from "../db/saveService";

const TILE_SIZE = 48;
const MAP_ROWS = TILE_MAP.length;
const MAP_COLS = TILE_MAP[0]!.length;
const WALKABLE = [0, 4, 5, 6];

// ビューポート: 奇数タイル数にするとプレイヤーが必ず中央に来る
const VIEWPORT_TILES = 7;
const VIEWPORT_PX = TILE_SIZE * VIEWPORT_TILES;
// 中央オフセット = ビューポート中央 - タイル半分
const CENTER_OFFSET = VIEWPORT_PX / 2 - TILE_SIZE / 2;

const TILE_NAMES: Record<number, string> = {
  0: "草原", 1: "水辺", 2: "森", 3: "岩場", 4: "道", 5: "🏘 町", 6: "⚔ ダンジョン",
};

type DPadButton = { dr: number; dc: number; label: string };
type DPadCell = DPadButton | null;

const DPAD: DPadCell[][] = [
  [null, { dr: -1, dc: 0, label: "▲" }, null],
  [{ dr: 0, dc: -1, label: "◀" }, null, { dr: 0, dc: 1, label: "▶" }],
  [null, { dr: 1, dc: 0, label: "▼" }, null],
];

interface PlayerPos { row: number; col: number; }

interface MapViewportProps {
  playerPos: PlayerPos;
  onSwipe: (dr: number, dc: number) => void;
}

function MapViewport({ playerPos, onSwipe }: MapViewportProps) {
  // カメラオフセット: マップを動かしてプレイヤーを中央に固定
  const translateX = CENTER_OFFSET - playerPos.col * TILE_SIZE;
  const translateY = CENTER_OFFSET - playerPos.row * TILE_SIZE;

  // スワイプ検出
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const SWIPE_THRESHOLD = 20;

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (t) touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

    // 縦横どちらの移動量が大きいか判定
    if (Math.abs(dx) >= Math.abs(dy)) {
      onSwipe(0, dx > 0 ? 1 : -1);
    } else {
      onSwipe(dy > 0 ? 1 : -1, 0);
    }
  };

  return (
    <Box
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      sx={{
        width: VIEWPORT_PX,
        height: VIEWPORT_PX,
        overflow: "hidden",
        position: "relative",
        border: "2px solid rgba(124,77,255,0.5)",
        borderRadius: 2,
        bgcolor: "#0d0d1a",
        touchAction: "none", // ブラウザのスクロールを無効化
        userSelect: "none",
      }}
    >
      {/* マップ全体をtransformで移動 */}
      <Box
        sx={{
          position: "absolute",
          display: "grid",
          gridTemplateColumns: `repeat(${MAP_COLS}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${MAP_ROWS}, ${TILE_SIZE}px)`,
          transform: `translate(${translateX}px, ${translateY}px)`,
          transition: "transform 0.1s ease-out",
          willChange: "transform",
        }}
      >
        {TILE_MAP.map((row, r) =>
          row.map((tile, c) => {
            const isPlayer = playerPos.row === r && playerPos.col === c;
            return (
              <Box
                key={`${r}-${c}`}
                sx={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  bgcolor: isPlayer ? "rgba(255,215,64,0.15)" : TILE_COLORS[tile],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: tile === 2 || tile === 3 ? 22 : 20,
                  outline: isPlayer ? "2px solid #ffd740" : "none",
                  outlineOffset: "-2px",
                  boxSizing: "border-box",
                }}
              >
                {isPlayer ? "🧑" : TILE_SYMBOLS[tile]}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}

export default function FieldPage() {
  const { dispatch } = useGame();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [playerPos, setPlayerPos] = useState<PlayerPos>({ row: 2, col: 4 });
  const [stepCount, setStepCount] = useState(0);

  // マップ座標をDBからロード
  useEffect(() => {
    loadGameData().then((saved) => {
      if (saved.playerPos) setPlayerPos(saved.playerPos);
    });
  }, []);

  // マップ座標をDBへデバウンスセーブ
  const posTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (posTimer.current) clearTimeout(posTimer.current);
    posTimer.current = setTimeout(() => {
      saveGameData({ playerPos });
    }, 1000);
    return () => { if (posTimer.current) clearTimeout(posTimer.current); };
  }, [playerPos]);

  const tryMove = useCallback((dr: number, dc: number) => {
    setPlayerPos((prev) => {
      const nr = prev.row + dr;
      const nc = prev.col + dc;
      if (nr < 0 || nr >= MAP_ROWS || nc < 0 || nc >= MAP_COLS) return prev;
      const tile = TILE_MAP[nr]![nc]!;
      if (!WALKABLE.includes(tile)) return prev;

      if (ENEMY_SPAWN_TILES.includes(tile) && Math.random() < 0.2) {
        const r = Math.random();
        const count = r < 0.6 ? 1 : r < 0.85 ? 2 : 3;
        const spawnedEnemies = Array.from({ length: count }, (_, k) => {
          const e = ENEMY_MASTER[Math.floor(Math.random() * ENEMY_MASTER.length)]!;
          return { ...e, hp: e.maxHp, id: `${e.id}-${Date.now()}-${k}` };
        });
        setTimeout(() => {
          dispatch({ type: "START_BATTLE", payload: { enemies: spawnedEnemies, turn: 0 } });
        }, 200);
      }

      setStepCount((s) => s + 1);
      return { row: nr, col: nc };
    });
  }, [dispatch]);

  // キーボード操作
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp"    || e.key === "w") { e.preventDefault(); tryMove(-1, 0); }
      if (e.key === "ArrowDown"  || e.key === "s") { e.preventDefault(); tryMove(1, 0); }
      if (e.key === "ArrowLeft"  || e.key === "a") { e.preventDefault(); tryMove(0, -1); }
      if (e.key === "ArrowRight" || e.key === "d") { e.preventDefault(); tryMove(0, 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tryMove]);

  const currentTile = TILE_MAP[playerPos.row]![playerPos.col]!;

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* ヘッダー */}
      <Card sx={{ mb: 1.5 }}>
        <CardContent sx={{ py: "8px !important", px: "12px !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="h6" sx={{ fontSize: { xs: 14, sm: 18 } }}>🗺 フィールド</Typography>
            <Chip label={TILE_NAMES[currentTile]} size="small" variant="outlined" />
            <Chip label={`歩数: ${stepCount}`} size="small" variant="outlined" />
            <Button size="small" variant="outlined" sx={{ ml: "auto" }} onClick={() => dispatch({ type: "SET_SCENE", payload: "guild" })}>
              ← 拠点へ
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* メインエリア */}
      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "center", sm: "flex-start" } }}>

        {/* マップ + コントロール */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
          <MapViewport playerPos={playerPos} onSwipe={tryMove} />

          {/* D-pad: モバイルは大きく、PCは小さめ */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "repeat(3, 1fr)",
              gap: 0.5,
              width: isMobile ? 168 : 144,
              height: isMobile ? 168 : 144,
            }}
          >
            {DPAD.map((row, ri) =>
              row.map((btn, ci) =>
                btn ? (
                  <Button
                    key={`${ri}-${ci}`}
                    variant="contained"
                    sx={{ minWidth: 0, p: 0, fontSize: isMobile ? 22 : 18, borderRadius: 2 }}
                    onPointerDown={(e) => {
                      e.preventDefault(); // タップ時の遅延を防ぐ
                      tryMove(btn.dr, btn.dc);
                    }}
                  >
                    {btn.label}
                  </Button>
                ) : (
                  <Box key={`${ri}-${ci}`} />
                )
              )
            )}
          </Box>

          {!isMobile && (
            <Typography variant="caption" color="text.secondary">
              キーボード: WASD / 矢印キー　|　マップをスワイプでも操作可
            </Typography>
          )}
          {isMobile && (
            <Typography variant="caption" color="text.secondary">
              マップをスワイプしても移動できます
            </Typography>
          )}
        </Box>

        {/* 凡例: PCのみ表示 */}
        {!isMobile && (
          <Card sx={{ minWidth: 150, height: "fit-content" }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>凡例</Typography>
              {Object.entries(TILE_NAMES).map(([k, v]) => (
                <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Box sx={{ width: 14, height: 14, bgcolor: TILE_COLORS[Number(k)], borderRadius: 0.5, flexShrink: 0 }} />
                  <Typography variant="caption">{v}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
