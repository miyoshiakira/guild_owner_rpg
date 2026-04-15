import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useGame } from "../store/gameStore";
import {
  MAP_MASTER_MAP,
  WALKABLE_TILES,
  DEFAULT_MAP_ID,
} from "../data/masters/mapMaster";
import type { MapMasterData } from "../data/masters/mapMaster";
import { ENEMY_MASTER, ENEMY_MAP } from "../data/masters/enemyMaster";
import type { EnemyMaster } from "../types/masters";
import type { Enemy } from "../types/game";
import { loadMapPosition, saveMapPosition } from "../db/saveService";
import { useBgm } from "../contexts/BgmContext";
import { MAP_BGM } from "../data/masters/bgmMaster";
import TownModal from "../components/TownModal";
import ShopModal from "../components/ShopModal";
import TownEnterButton from "../components/TownEnterButton";
import InteractButton from "../components/InteractButton";
import WorldMapModal from "../components/WorldMapModal";
import MapInfoCard from "../components/field/MapInfoCard";
import MapLegendCard from "../components/field/MapLegendCard";
import FieldHeader from "../components/field/FieldHeader";
import EventModal from "../components/EventModal";
import CircularDPad from "../components/field/CircularDPad";
import MapViewport from "../components/field/MapViewport";
import { getEventsByMap } from "../data/masters/storyEventMaster";
import { getActivatableEvent } from "../hooks/useEventHandlers";
import { mapLevel, scaleEnemy } from "../utils/fieldUtils";
import { filterVisibleEvents } from "../utils/eventFilter";
import { TOWN_MAP } from "../data/masters/townMaster";

// ── メインページ ──────────────────────────────────────────────────────────

interface PlayerPos { row: number; col: number; }
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
      return;
    }

    // イベントチェック（遷移マスでない場合のみ）
    const event = getActivatableEvent(map.id, nr, nc, state, "step");
    if (event) {
      setTimeout(() => {
        setCurrentEventId(event.id);
        setShowEventModal(true);
      }, 100);
      return;
    }

    // ランダム接敵（遷移マス・イベントマスでない場合のみ）
    if (map.enemySpawnTiles.includes(tile) && Math.random() < 0.2) {
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

  // interact イベントのチェック
  const interactEvent = getActivatableEvent(currentMapId, playerPos.row, playerPos.col, state, "interact");

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
            mapId={currentMapId}
            gameState={state}
            events={filterVisibleEvents(
              getEventsByMap(currentMapId),
              state.storyProgress.completedEvents,
              state.storyFlags,
              currentMap
            )}
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

      {/* 会話ボタン (interact イベント) */}
      {interactEvent && (
        <InteractButton onInteract={() => {
          setCurrentEventId(interactEvent.id);
          setShowEventModal(true);
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
