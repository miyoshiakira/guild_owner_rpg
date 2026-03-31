import { useState, useEffect, useCallback } from "react";
import { Box, Card, CardContent, Typography, Chip, Button } from "@mui/material";
import { useGame } from "../store/gameStore";
import { TILE_MAP, TILE_COLORS, TILE_SYMBOLS, ENEMY_SPAWN_TILES, ENEMIES } from "../data/testData";

const TILE_SIZE = 48;
const MAP_ROWS = TILE_MAP.length;
const MAP_COLS = TILE_MAP[0]!.length;

const WALKABLE = [0, 4, 5, 6];

interface PlayerPos {
  row: number;
  col: number;
}

function MapCanvas({ playerPos }: { playerPos: PlayerPos }) {
  return (
    <Box
      sx={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(${MAP_COLS}, ${TILE_SIZE}px)`,
        border: "2px solid rgba(124,77,255,0.4)",
        borderRadius: 1,
        overflow: "hidden",
        userSelect: "none",
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
                bgcolor: TILE_COLORS[tile],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: tile === 2 || tile === 3 ? 22 : 20,
                border: isPlayer ? "2px solid #ffd740" : "none",
                boxSizing: "border-box",
                position: "relative",
              }}
            >
              {isPlayer ? "🧑" : TILE_SYMBOLS[tile]}
            </Box>
          );
        })
      )}
    </Box>
  );
}

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

export default function FieldPage() {
  const { dispatch } = useGame();
  const [playerPos, setPlayerPos] = useState<PlayerPos>({ row: 2, col: 4 });
  const [stepCount, setStepCount] = useState(0);

  const tryMove = useCallback((dr: number, dc: number) => {
    setPlayerPos((prev) => {
      const nr = prev.row + dr;
      const nc = prev.col + dc;
      if (nr < 0 || nr >= MAP_ROWS || nc < 0 || nc >= MAP_COLS) return prev;
      const tile = TILE_MAP[nr]![nc]!;
      if (!WALKABLE.includes(tile)) return prev;

      if (ENEMY_SPAWN_TILES.includes(tile) && Math.random() < 0.2) {
        const enemy = ENEMIES[Math.floor(Math.random() * ENEMIES.length)]!;
        setTimeout(() => {
          dispatch({
            type: "START_BATTLE",
            payload: { enemy: { ...enemy, hp: enemy.maxHp }, turn: 0 },
          });
        }, 200);
      }

      setStepCount((s) => s + 1);
      return { row: nr, col: nc };
    });
  }, [dispatch]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp" || e.key === "w") tryMove(-1, 0);
      if (e.key === "ArrowDown" || e.key === "s") tryMove(1, 0);
      if (e.key === "ArrowLeft" || e.key === "a") tryMove(0, -1);
      if (e.key === "ArrowRight" || e.key === "d") tryMove(0, 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tryMove]);

  const currentTile = TILE_MAP[playerPos.row]![playerPos.col]!;

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: "12px !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Typography variant="h6">🗺 フィールド</Typography>
            <Chip label={`現在地: ${TILE_NAMES[currentTile]}`} size="small" variant="outlined" />
            <Chip label={`歩数: ${stepCount}`} size="small" variant="outlined" />
            <Button size="small" variant="outlined" onClick={() => dispatch({ type: "SET_SCENE", payload: "guild" })}>
              ← ギルドへ戻る
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Box>
          <MapCanvas playerPos={playerPos} />

          {/* 十字キーUI */}
          <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: "repeat(3, 48px)", gridTemplateRows: "repeat(3, 48px)", gap: 0.5 }}>
            {DPAD.map((row, ri) =>
              row.map((btn, ci) =>
                btn ? (
                  <Button
                    key={`${ri}-${ci}`}
                    variant="contained"
                    sx={{ minWidth: 48, height: 48, p: 0, fontSize: 18 }}
                    onClick={() => tryMove(btn.dr, btn.dc)}
                  >
                    {btn.label}
                  </Button>
                ) : (
                  <Box key={`${ri}-${ci}`} />
                )
              )
            )}
          </Box>
        </Box>

        {/* 凡例 */}
        <Card sx={{ minWidth: 160, height: "fit-content" }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>凡例</Typography>
            {Object.entries(TILE_NAMES).map(([k, v]) => (
              <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                <Box sx={{ width: 16, height: 16, bgcolor: TILE_COLORS[Number(k)], borderRadius: 0.5, flexShrink: 0 }} />
                <Typography variant="caption">{v}</Typography>
              </Box>
            ))}
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              キーボード: WASD / 矢印キー
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
