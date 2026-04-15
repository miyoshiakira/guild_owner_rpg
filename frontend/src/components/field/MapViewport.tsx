import { useRef } from "react";
import { Box } from "@mui/material";
import type { MapMasterData } from "../../data/masters/mapMaster";
import type { StoryEvent } from "../../types/masters";
import type { GameState } from "../../types/game";
import { TILE_CHIP_POS, CHIP_SHEET_COLS, CHIP_SRC_SIZE } from "../../data/map/mapChipConfig";
import mapChipUrl from "../../data/map/BaseMapChip.png";
import { getActivatableEvent } from "../../hooks/useEventHandlers";

const TILE_SIZE = 48;
const VIEWPORT_TILES = 7;
const VIEWPORT_PX = TILE_SIZE * VIEWPORT_TILES;
const CENTER_OFFSET = VIEWPORT_PX / 2 - TILE_SIZE / 2;

interface PlayerPos { row: number; col: number; }

interface MapViewportProps {
  playerPos: PlayerPos;
  onSwipe: (dr: number, dc: number) => void;
  currentMap: MapMasterData;
  mapId: string;
  gameState: GameState;
  events: StoryEvent[];
  storyFlags: Record<string, boolean>;
}

export default function MapViewport({ playerPos, onSwipe, currentMap, mapId, gameState, events, storyFlags }: MapViewportProps) {
  const tileMap = currentMap.tileMap;
  const MAP_ROWS = tileMap.length;
  const MAP_COLS = tileMap[0]!.length;

  const translateX = CENTER_OFFSET - playerPos.col * TILE_SIZE;
  const translateY = CENTER_OFFSET - playerPos.row * TILE_SIZE;

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
        touchAction: "none",
        userSelect: "none",
      }}
    >
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
        {tileMap.map((row, r) =>
          row.map((tile, c) => {
            const isPlayer = playerPos.row === r && playerPos.col === c;
            const isPortal = tile === 9;
            const chip = TILE_CHIP_POS[tile] ?? TILE_CHIP_POS[0]!;
            const chipBgX = -(chip[1] * TILE_SIZE);
            const chipBgY = -(chip[0] * TILE_SIZE);
            const sheetDisplayW = CHIP_SHEET_COLS * TILE_SIZE;
            const sheetDisplayH = Math.round((1000 / CHIP_SRC_SIZE) * TILE_SIZE);
            const eventTile = getActivatableEvent(mapId, r, c, gameState);
            return (
              <Box
                key={`${r}-${c}`}
                sx={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  backgroundImage: `url(${mapChipUrl})`,
                  backgroundPosition: `${chipBgX}px ${chipBgY}px`,
                  backgroundSize: `${sheetDisplayW}px ${sheetDisplayH}px`,
                  backgroundRepeat: "no-repeat",
                  imageRendering: "pixelated",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  outline: isPlayer ? "2px solid #ffd740" : "none",
                  outlineOffset: "-2px",
                  boxSizing: "border-box",
                  boxShadow: isPlayer
                    ? "inset 0 0 14px rgba(255,215,64,0.5)"
                    : "none",
                  animation: isPortal ? "portal-pulse 1.5s ease-in-out infinite" : "none",
                  position: "relative",
                }}
              >
                {eventTile && (
                  <Box
                    component="span"
                    sx={{
                      position: "absolute",
                      fontSize: 26,
                      animation: "event-pulse 2s ease-in-out infinite",
                      filter: eventTile.data.type === "battle"
                        ? "drop-shadow(0 0 8px rgba(255,80,80,0.9))"
                        : "drop-shadow(0 0 8px rgba(255,215,0,0.8))",
                      zIndex: 1,
                    }}
                  >
                    {eventTile.data.type === "battle" ? "⚔️" : "💬"}
                  </Box>
                )}
                {isPlayer && (
                  <Box
                    component="span"
                    sx={{
                      display: "inline-block",
                      animation: "player-bounce 0.9s ease-in-out infinite",
                      lineHeight: 1,
                      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))",
                      zIndex: 2,
                    }}
                  >
                    🧑
                  </Box>
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
}
