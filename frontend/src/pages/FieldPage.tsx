import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useGame } from "../store/gameStore";
import {
  MAP_MASTER_MAP,
  WALKABLE_TILES,
  DEFAULT_MAP_ID,
} from "../data/masters/mapMaster";
import { TILE_CHIP_POS, CHIP_SHEET_COLS, CHIP_SRC_SIZE, MAP_TILE_MASTER } from "../data/map/mapChipConfig";
import mapChipUrl from "../data/map/BaseMapChip.png";
import { TOWN_MAP } from "../data/masters/townMaster";
import type { MapMasterData } from "../data/masters/mapMaster";
import { ENEMY_MASTER, ENEMY_MAP } from "../data/masters/enemyMaster";
import type { EnemyMaster, StoryEvent } from "../types/masters";
import type { Enemy } from "../types/game";
import { loadMapPosition, saveMapPosition } from "../db/saveService";
import { useBgm } from "../contexts/BgmContext";
import { MAP_BGM } from "../data/masters/bgmMaster";
import TownModal from "../components/TownModal";
import ShopModal from "../components/ShopModal";
import TownEnterButton from "../components/TownEnterButton";
import WorldMapModal from "../components/WorldMapModal";
import MapInfoCard from "../components/field/MapInfoCard";
import MapLegendCard from "../components/field/MapLegendCard";
import FieldHeader from "../components/field/FieldHeader";
import EventModal from "../components/EventModal";
import { getEventsByMap } from "../data/masters/storyEventMaster";

/**
 * マップの baseLevel と levelVariance からランダムなレベルを決定する。
 */
function mapLevel(baseLevel: number, levelVariance: number): number {
  return baseLevel + Math.floor(Math.random() * (levelVariance + 1));
}

/**
 * Lv1 マスタデータを指定レベルにスケーリングして Enemy を生成する。
 */
function scaleEnemy(master: EnemyMaster, level: number, uid: string): Enemy {
  const f = 1 + (level - 1) * 0.35;
  const hp = Math.round(master.maxHp * f);
  return {
    ...master,
    id: uid,
    masterId: master.id,
    level,
    hp,
    maxHp: hp,
    mp:    Math.round(master.maxMp * f),
    maxMp: Math.round(master.maxMp * f),
    atk:   Math.round(master.atk * f),
    def:   Math.round(master.def * f),
    spd:   Math.round(master.spd * f),
    reward: {
      exp:  Math.round(master.reward.exp  * Math.pow(level, 1.4)),
      gold: Math.round(master.reward.gold * Math.pow(level, 1.2)),
    },
  };
}

const TILE_SIZE = 48;

// ビューポート: 奇数タイル数にするとプレイヤーが必ず中央に来る
const VIEWPORT_TILES = 7;
const VIEWPORT_PX = TILE_SIZE * VIEWPORT_TILES;
// 中央オフセット = ビューポート中央 - タイル半分
const CENTER_OFFSET = VIEWPORT_PX / 2 - TILE_SIZE / 2;

interface PlayerPos { row: number; col: number; }

// ── 円形モバイルパッド ──────────────────────────────────────────────────
const PAD_SIZE = 160;
const BTN_SIZE = 50;

const PAD_DIRS = [
  { dr: -1, dc:  0, key: "up",    label: "▲",
    pos: { top: 4, left: PAD_SIZE / 2 - BTN_SIZE / 2 } },
  { dr:  1, dc:  0, key: "down",  label: "▼",
    pos: { bottom: 4, left: PAD_SIZE / 2 - BTN_SIZE / 2 } },
  { dr:  0, dc: -1, key: "left",  label: "◀",
    pos: { left: 4, top: PAD_SIZE / 2 - BTN_SIZE / 2 } },
  { dr:  0, dc:  1, key: "right", label: "▶",
    pos: { right: 4, top: PAD_SIZE / 2 - BTN_SIZE / 2 } },
] as const;

function CircularDPad({ onMove }: { onMove: (dr: number, dc: number) => void }) {
  const holdTimer    = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const startMove = useCallback((dr: number, dc: number, key: string) => {
    setActiveKey(key);
    onMove(dr, dc);
    holdTimer.current = setTimeout(() => {
      holdInterval.current = setInterval(() => onMove(dr, dc), 130);
    }, 220);
  }, [onMove]);

  const stopMove = useCallback(() => {
    setActiveKey(null);
    if (holdTimer.current)    { clearTimeout(holdTimer.current);   holdTimer.current    = null; }
    if (holdInterval.current) { clearInterval(holdInterval.current); holdInterval.current = null; }
  }, []);

  useEffect(() => () => stopMove(), [stopMove]);

  return (
    <Box sx={{ position: "relative", width: PAD_SIZE, height: PAD_SIZE, flexShrink: 0, userSelect: "none" }}>
      <Box sx={{
        position: "absolute", inset: 0,
        borderRadius: "50%",
        background: "radial-gradient(circle at 40% 35%, rgba(60,50,100,0.9) 0%, rgba(15,12,32,0.97) 100%)",
        border: "2px solid rgba(124,77,255,0.35)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
      }} />
      <Box sx={{
        position: "absolute",
        top: "50%", left: BTN_SIZE + 8, right: BTN_SIZE + 8,
        height: 1, bgcolor: "rgba(124,77,255,0.18)", transform: "translateY(-50%)",
      }} />
      <Box sx={{
        position: "absolute",
        left: "50%", top: BTN_SIZE + 8, bottom: BTN_SIZE + 8,
        width: 1, bgcolor: "rgba(124,77,255,0.18)", transform: "translateX(-50%)",
      }} />
      <Box sx={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 28, height: 28,
        borderRadius: "50%",
        background: "radial-gradient(circle at 40% 35%, rgba(160,130,255,0.25), rgba(80,60,160,0.15))",
        border: "1.5px solid rgba(124,77,255,0.4)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
      }} />
      {PAD_DIRS.map(({ dr, dc, key, label, pos }) => {
        const active = activeKey === key;
        return (
          <Box
            key={key}
            sx={{
              position: "absolute",
              width: BTN_SIZE, height: BTN_SIZE,
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              touchAction: "none",
              background: active
                ? "radial-gradient(circle, rgba(160,120,255,0.7), rgba(100,60,200,0.5))"
                : "radial-gradient(circle at 40% 35%, rgba(100,80,180,0.35), rgba(60,40,120,0.2))",
              border: `1.5px solid ${active ? "rgba(180,150,255,0.9)" : "rgba(124,77,255,0.5)"}`,
              boxShadow: active
                ? "0 0 16px rgba(124,77,255,0.7), inset 0 1px 0 rgba(255,255,255,0.2)"
                : "inset 0 1px 0 rgba(255,255,255,0.08)",
              transform: active ? "scale(0.86)" : "scale(1)",
              transition: "transform 0.07s, background 0.07s, box-shadow 0.07s, border-color 0.07s",
              ...pos,
            }}
            onPointerDown={(e) => { e.preventDefault(); startMove(dr, dc, key); }}
            onPointerUp={stopMove}
            onPointerLeave={stopMove}
            onPointerCancel={stopMove}
          >
            <Typography sx={{
              fontSize: 17, lineHeight: 1, fontWeight: 700,
              color: active ? "#fff" : "rgba(180,160,255,0.9)",
              textShadow: active ? "0 0 8px rgba(200,180,255,0.8)" : "none",
            }}>
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

// ── マップビューポート ────────────────────────────────────────────────────
interface MapViewportProps {
  playerPos: PlayerPos;
  onSwipe: (dr: number, dc: number) => void;
  currentMap: MapMasterData;
  events: StoryEvent[];
  storyFlags: Record<string, boolean>;
}

function MapViewport({ playerPos, onSwipe, currentMap, events, storyFlags }: MapViewportProps) {
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
            const sheetDisplayW = CHIP_SHEET_COLS * TILE_SIZE; // スケール後シート幅
            // 元シートの縦比率を保って高さを算出
            const sheetDisplayH = Math.round((1000 / CHIP_SRC_SIZE) * TILE_SIZE);
            const eventAtTile = events.find(e => e.position.row === r && e.position.col === c);
            // イベントフラグが立っている場合は非表示
            const shouldHideEvent = eventAtTile && (() => {
              const eventData = eventAtTile.data;
              // バトルイベントの勝利報酬にフラグがある場合
              if (eventData.type === "battle") {
                const flagReward = eventData.winRewards?.find(r => r.type === "flag");
                if (flagReward && flagReward.flag) {
                  return storyFlags[flagReward.flag] === true;
                }
              }
              // 会話イベントの選択肢報酬にフラグがある場合
              if (eventData.type === "conversation") {
                const hasFlagReward = eventData.choices?.some(c => c.rewards?.some(r => r.type === "flag"));
                if (hasFlagReward) {
                  // いずれかのフラグが立っている場合
                  return eventData.choices!.some(c =>
                    c.rewards?.some(r => r.type === "flag" && storyFlags[r.flag!] === true)
                  );
                }
              }
              return false;
            })();
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
                {eventAtTile && !shouldHideEvent && (
                  <Box
                    component="span"
                    sx={{
                      position: "absolute",
                      fontSize: 26,
                      animation: "event-pulse 2s ease-in-out infinite",
                      filter: eventAtTile.data.type === "battle"
                        ? "drop-shadow(0 0 8px rgba(255,80,80,0.9))"
                        : "drop-shadow(0 0 8px rgba(255,215,0,0.8))",
                      zIndex: 1,
                    }}
                  >
                    {eventAtTile.data.type === "battle" ? "⚔️" : "💬"}
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

// ── メインページ ──────────────────────────────────────────────────────────
export default function FieldPage() {
  const { state, dispatch } = useGame();
  const { play: playBgm } = useBgm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [currentMapId, setCurrentMapId] = useState<string>(DEFAULT_MAP_ID);
  const [playerPos, setPlayerPos]       = useState<PlayerPos>({ row: 2, col: 4 });
  const [stepCount, setStepCount]       = useState(0);
  // "idle" | "out" (フェードアウト中) | "in" (フェードイン中)
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "out" | "in">("idle");
  const [transitionLabel, setTransitionLabel] = useState<string>("");
  const [showTownModal, setShowTownModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [isPositionLoading, setIsPositionLoading] = useState(false);
  const [showWorldMap, setShowWorldMap] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  const posLoaded = useRef(false);
  // 遷移先情報を保持（フェードアウト完了後に適用）
  const pendingTransition = useRef<{ mapId: string; pos: PlayerPos } | null>(null);
  // 最新の map/pos を ref で追跡して stale closure を防ぐ
  const currentMapRef    = useRef<MapMasterData>(MAP_MASTER_MAP[DEFAULT_MAP_ID]!);
  const playerPosRef     = useRef<PlayerPos>({ row: 2, col: 4 });
  const transitionPhaseRef = useRef<"idle" | "out" | "in">("idle");
  // スロットリング: 最後に移動が受け付けられた時刻
  const lastMoveTimeRef  = useRef<number>(0);

  const currentMap = MAP_MASTER_MAP[currentMapId] ?? MAP_MASTER_MAP[DEFAULT_MAP_ID]!;

  // ref を最新値と同期
  useEffect(() => { currentMapRef.current = currentMap; }, [currentMap]);
  useEffect(() => { playerPosRef.current = playerPos; }, [playerPos]);
  useEffect(() => { transitionPhaseRef.current = transitionPhase; }, [transitionPhase]);

  // マップ入場時: 訪問済み記録 & BGM 再生
  useEffect(() => {
    dispatch({ type: "VISIT_MAP", payload: currentMapId });
    const bgmId = MAP_BGM[currentMapId];
    if (bgmId) playBgm(bgmId);
  }, [currentMapId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ロード: activeSlot を使ってマップ位置だけを読み込む
  useEffect(() => {
    const slotId = state.activeSlot;
    setIsPositionLoading(true);
    loadMapPosition(slotId).then((saved) => {
      posLoaded.current = true;
      setIsPositionLoading(false);
      if (saved.playerPos) setPlayerPos(saved.playerPos);
      if (saved.currentMapId) setCurrentMapId(saved.currentMapId);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // マップ遷移: フェードアウト → マップ切り替え → フェードイン
  const doTransition = useCallback((toMapId: string, toPos: PlayerPos, label: string) => {
    pendingTransition.current = { mapId: toMapId, pos: toPos };
    setTransitionLabel(label);
    setTransitionPhase("out");
  }, []);

  // フェードアウト完了 → データ切り替え → フェードイン開始
  useEffect(() => {
    if (transitionPhase !== "out") return;
    const t = setTimeout(() => {
      const p = pendingTransition.current;
      if (p) {
        setCurrentMapId(p.mapId);
        setPlayerPos(p.pos);
        playerPosRef.current = p.pos;
        pendingTransition.current = null;
        // マップ遷移完了時に即座に位置を保存（デバウンスなし）
        saveMapPosition(state.activeSlot, p.pos, p.mapId);
      }
      setTransitionPhase("in");
    }, 420);
    return () => clearTimeout(t);
  }, [transitionPhase, state.activeSlot]);

  // フェードイン完了 → idle
  useEffect(() => {
    if (transitionPhase !== "in") return;
    const t = setTimeout(() => setTransitionPhase("idle"), 420);
    return () => clearTimeout(t);
  }, [transitionPhase]);

  // ワールドマップからワープ
  const handleWarp = useCallback((mapId: string) => {
    const mapData = MAP_MASTER_MAP[mapId];
    if (!mapData) return;
    setCurrentMapId(mapId);
    setPlayerPos(mapData.defaultPos);
    playerPosRef.current = mapData.defaultPos;
    setShowWorldMap(false);
    saveMapPosition(state.activeSlot, mapData.defaultPos, mapId);
  }, [state.activeSlot]);

  // 移動処理（ref ベースで stale closure を回避）
  const MOVE_INTERVAL_MS = 100; // キーリピートを 100ms に制限
  const tryMove = useCallback((dr: number, dc: number) => {
    if (isPositionLoading) return;
    if (transitionPhaseRef.current !== "idle") return;

    // スロットリング: OS キーリピートの過剰発火を間引く
    const now = Date.now();
    if (now - lastMoveTimeRef.current < MOVE_INTERVAL_MS) return;
    lastMoveTimeRef.current = now;

    const map = currentMapRef.current;
    const prev = playerPosRef.current;
    const tileMap = map.tileMap;
    const MAP_ROWS = tileMap.length;
    const MAP_COLS = tileMap[0]!.length;
    const nr = prev.row + dr;
    const nc = prev.col + dc;

    if (nr < 0 || nr >= MAP_ROWS || nc < 0 || nc >= MAP_COLS) return;
    const tile = tileMap[nr]![nc]!;
    if (!WALKABLE_TILES.has(tile)) return;

    // ref を即時更新（レンダー完了を待たず次の tryMove で正しい位置を使えるようにする）
    playerPosRef.current = { row: nr, col: nc };
    setPlayerPos({ row: nr, col: nc });
    setStepCount((s) => s + 1);

    // ポータル遷移チェック
    const transition = map.transitions.find(
      (t) => t.fromRow === nr && t.fromCol === nc
    );

    if (transition) {
      setTimeout(() => {
        doTransition(transition.toMapId, { row: transition.toRow, col: transition.toCol }, transition.label);
      }, 150);
    } else if (map.enemySpawnTiles.includes(tile) && Math.random() < 0.2) {
      const r = Math.random();
      const count = r < 0.6 ? 1 : r < 0.85 ? 2 : 3;
      const level = mapLevel(map.baseLevel, map.levelVariance);
      const now = Date.now();
      // マップ固有の敵プールからランダム選出 (未定義 ID は除外)
      const pool = map.enemyIds
        .map((id) => ENEMY_MAP[id])
        .filter((m): m is EnemyMaster => m !== undefined);
      const src = pool.length > 0 ? pool : ENEMY_MASTER;
      const spawnedEnemies = Array.from({ length: count }, (_, k) => {
        const master = src[Math.floor(Math.random() * src.length)]!;
        return scaleEnemy(master, level, `${master.id}-${now}-${k}`);
      });
      // 戦闘開始時の座標をDBにセーブ（FieldPageはアンマウットされるため再マウット後に読み込まれる）
      saveMapPosition(state.activeSlot, { row: nr, col: nc }, currentMapRef.current.id);
      setTimeout(() => {
        dispatch({ type: "START_BATTLE", payload: { enemies: spawnedEnemies, turn: 0 } });
      }, 200);
    } else {
      // イベントチェック
      const events = getEventsByMap(map.id);
      const event = events.find(e => e.position.row === nr && e.position.col === nc && e.trigger === "step");
      if (event && !state.storyProgress.completedEvents.includes(event.id)) {
        // 前提フラグをチェック
        if (event.prerequisites) {
          const hasPrerequisites = event.prerequisites.every(flag => state.storyFlags[flag] === true);
          if (!hasPrerequisites) return;
        }
        // 簡易的な条件チェック（TODO: 完全な条件チェックを実装）
        setTimeout(() => {
          setCurrentEventId(event.id);
          setShowEventModal(true);
        }, 100);
      }
    }
  }, [dispatch, doTransition, state.storyProgress]);

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

  const currentTile = currentMap.tileMap[playerPos.row]?.[playerPos.col] ?? 0;
  const getCurrentTown = () => {
    if (!currentMap.townTileMappings) return undefined;
    
    const townMapping = currentMap.townTileMappings.find(
      mapping => mapping.row === playerPos.row && mapping.col === playerPos.col
    );
    return townMapping ? TOWN_MAP[townMapping.townId] : undefined;
  };
  const currentTown = getCurrentTown();

  const handleShop = () => {
    setShowTownModal(false);
    if (currentTown) {
      setShowShopModal(true);
    }
  };

  const handleInteract = () => {
    setShowTownModal(false);
    // TODO: 交流画面へ遷移
    dispatch({ type: "NOTIFY", payload: { message: "交流機能は準備中です", severity: "info" } });
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, position: "relative" }}>

      {/* マップ遷移オーバーレイ */}
      <Box sx={{
        position: "fixed",
        inset: 0,
        bgcolor: "black",
        zIndex: 9999,
        pointerEvents: transitionPhase !== "idle" ? "all" : "none",
        opacity: transitionPhase === "out" ? 1 : 0,
        animation: transitionPhase === "out"
          ? "map-fade-out 0.42s ease forwards"
          : transitionPhase === "in"
          ? "map-fade-in 0.42s ease forwards"
          : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {transitionPhase !== "idle" && (
          <Typography sx={{ color: "rgba(180,140,255,0.9)", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>
            {transitionLabel}
          </Typography>
        )}
      </Box>

      {/* ヘッダー */}
      <FieldHeader
        currentMap={currentMap}
        currentTile={currentTile}
        stepCount={stepCount}
        onWorldMapClick={() => setShowWorldMap(true)}
      />

      {/* メインエリア */}
      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "center", sm: "flex-start" } }}>

        {/* マップ + コントロール */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
          <MapViewport
            playerPos={playerPos}
            onSwipe={tryMove}
            currentMap={currentMap}
            events={getEventsByMap(currentMapId).filter(e => {
              // 完了したイベントは非表示
              if (state.storyProgress.completedEvents.includes(e.id)) return false;
              // 前提フラグをチェック
              if (e.prerequisites) {
                return e.prerequisites.every(flag => (state.storyFlags[flag] ?? false) === true);
              }
              // 条件をチェック
              if (e.conditions) {
                return e.conditions.every(c => {
                  if (c.type === "flag") {
                    const flagValue = state.storyFlags[c.flag!] ?? false;
                    return flagValue === c.value;
                  }
                  return true;
                });
              }
              // タイルが進行可能かチェック
              const tileAtEvent = currentMap.tileMap[e.position.row]?.[e.position.col];
              if (tileAtEvent !== undefined) {
                const tileConfig = MAP_TILE_MASTER[tileAtEvent];
                if (tileConfig && !tileConfig.walkable) {
                  return false;
                }
              }
              return true;
            })}
            storyFlags={state.storyFlags}
          />

          {/* 円形モバイルパッド */}
          <CircularDPad onMove={tryMove} />

          <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
            {isMobile
              ? "長押しで連続移動 | スワイプも可"
              : "長押しで連続移動 | WASD / 矢印キーも可"}
          </Typography>
        </Box>

        {/* 凡例 + マップ情報: PCのみ表示 */}
        {!isMobile && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {/* マップ情報 */}
            <MapInfoCard currentMap={currentMap} />

            {/* 凡例 */}
            <MapLegendCard />
          </Box>
        )}
      </Box>

      {/* 町モーダル */}
      <TownModal
        open={showTownModal}
        onClose={() => setShowTownModal(false)}
        onShop={handleShop}
        onInteract={handleInteract}
        town={currentTown}
      />

      {/* 買い物モーダル */}
      {currentTown && (
        <ShopModal
          open={showShopModal}
          onClose={() => setShowShopModal(false)}
          town={currentTown}
        />
      )}

      {/* 町入るボタン */}
      {currentTile === 5 && currentTown && (
        <TownEnterButton onEnterTown={() => {
          dispatch({ type: "HEAL_PARTY" });
          dispatch({ type: "NOTIFY", payload: { message: "🏥 仲間のHPとMPが全回復した！", severity: "success" } });
          saveMapPosition(state.activeSlot, playerPos, currentMapId);
          setShowTownModal(true);
        }} />
      )}

      {/* イベントモーダル */}
      {currentEventId && (
        <EventModal
          open={showEventModal}
          eventId={currentEventId}
          onClose={() => {
            setShowEventModal(false);
            setCurrentEventId(null);
            saveMapPosition(state.activeSlot, playerPos, currentMapId);
          }}
          onBattleStart={(enemyIds) => {
            const level = mapLevel(currentMap.baseLevel, currentMap.levelVariance);
            const now = Date.now();
            const spawnedEnemies = enemyIds.map((id, k) => {
              const master = ENEMY_MAP[id];
              if (!master) return null;
              return scaleEnemy(master, level, `${id}-${now}-${k}`);
            }).filter((e): e is Enemy => e !== null);
            if (spawnedEnemies.length > 0) {
              // 戦闘開始時の座標をDBにセーブ
              saveMapPosition(state.activeSlot, playerPos, currentMapId);
              dispatch({ type: "START_BATTLE", payload: { enemies: spawnedEnemies, turn: 0, pendingEventId: currentEventId } });
            }
          }}
        />
      )}

      {/* ローディングオーバーレイ */}
      {isPositionLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <Typography sx={{ color: "white", fontSize: 24 }}>読み込み中...</Typography>
        </Box>
      )}

      {/* ワールドマップモーダル */}
      <WorldMapModal
        open={showWorldMap}
        onClose={() => setShowWorldMap(false)}
        currentMapId={currentMap.id}
        visitedMapIds={state.visitedMapIds}
        onWarp={handleWarp}
      />
    </Box>
  );
}
