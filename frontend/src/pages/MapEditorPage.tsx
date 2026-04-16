import {
  useState, useCallback, useRef, useMemo, useEffect,
} from "react";
import {
  Box, Typography, Select, MenuItem, FormControl, InputLabel,
  Button, Tooltip, Switch, FormControlLabel, Divider, Chip,
  TextField, ToggleButton, ToggleButtonGroup, IconButton, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import BrushIcon from "@mui/icons-material/Brush";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import MouseIcon from "@mui/icons-material/Mouse";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import UpgradeIcon from "@mui/icons-material/Upgrade";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { MAP_TILE_MASTER } from "../data/map/mapChipConfig";
import { MAP_IDS, MAP_MASTER_MAP, MAP_TRANSITIONS, MAP_ADDITIONS, TileType } from "../data/masters/mapMaster";
import type { MapTransition, MapMasterAddition } from "../data/masters/mapMaster";
import { STORY_EVENT_MASTER } from "../data/masters/storyEventMaster";
import { STORY_NPC_MASTER } from "../data/masters/storyNPCMaster";
import { useGame } from "../store/gameStore";
import type { StoryEvent, StoryNPC } from "../types/masters";

// ─── 定数 ─────────────────────────────────────────────────────────────────
const MAP_LIST = Object.entries(MAP_IDS).map(([, id]) => ({
  id,
  name: MAP_MASTER_MAP[id]?.name ?? id,
}));
const TILE_IDS = Object.keys(MAP_TILE_MASTER).map(Number).sort((a, b) => a - b);
const TRIGGER_COLOR: Record<StoryEvent["trigger"], string> = {
  step: "#ffd740",
  interact: "#40c4ff",
};
const CELL_SIZE = 26;

type Tool = "paint" | "fill" | "select";

// ─── ユーティリティ ──────────────────────────────────────────────────────
function cloneGrid(g: number[][]): number[][] { return g.map(r => [...r]); }
function toCsv(g: number[][]): string { return g.map(r => r.join(",")).join("\n"); }

function floodFill(grid: number[][], sr: number, sc: number, replaceTile: number): number[][] {
  const target = grid[sr][sc];
  if (target === replaceTile) return grid;
  const next = cloneGrid(grid);
  const rows = next.length, cols = next[0].length;
  const stack: [number, number][] = [[sr, sc]];
  while (stack.length) {
    const [r, c] = stack.pop()!;
    if (r < 0 || r >= rows || c < 0 || c >= cols || next[r][c] !== target) continue;
    next[r][c] = replaceTile;
    stack.push([r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]);
  }
  return next;
}

function generateNewMapId(existingIds: string[]): string {
  const nums = existingIds.map(id => {
    const m = id.match(/^map-(\d+)$/);
    return m ? parseInt(m[1]) : 0;
  });
  const next = Math.max(0, ...nums) + 1;
  return `map-${String(next).padStart(3, "0")}`;
}

function makeBlankGrid(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

/** 昇格用コードスニペットを生成 */
function buildPromoteSnippets(m: MapMasterAddition) {
  // map-019 → "019" → "19" → "19" (import変数名用に先頭0除去)
  const num = m.id.replace(/^map-0*/, "");
  const numPadded = m.id.replace(/^map-/, ""); // "019"
  const constName = `MAP${num}_TILES`;
  const csvFile = `map-${numPadded}.csv`;

  const cellMasterSnippet =
    `// mapCellMaster.ts に追加\n` +
    `import map${num}Csv from '../maps/${csvFile}?raw';\n` +
    `export const ${constName}: number[][] = parseCsv(map${num}Csv);`;

  const mapEntry =
    `// mapMaster.ts の STATIC_MAP_MASTER 末尾に追加\n` +
    `  {\n` +
    `    id: "${m.id}",\n` +
    `    name: "${m.name}",\n` +
    `    description: "${m.description}",\n` +
    `    emoji: "${m.emoji}",\n` +
    `    enemySpawnTiles: [TileType.GRASS],\n` +
    `    enemyIds: [],\n` +
    `    baseLevel: ${m.baseLevel},\n` +
    `    levelVariance: ${m.levelVariance},\n` +
    `    defaultPos: { row: ${m.defaultPos.row}, col: ${m.defaultPos.col} },\n` +
    `    transitions: MAP_TRANSITIONS["${m.id}"] ?? [],\n` +
    `    tileMap: ${constName},\n` +
    `  },`;

  return { csvFile, constName, cellMasterSnippet, mapEntry };
}

function makeNewEvent(mapId: string, row: number, col: number): StoryEvent {
  return {
    id: `evt-new-${Date.now()}`,
    name: "新規イベント",
    description: "",
    chapter: 0,
    mapId,
    position: { row, col },
    trigger: "step",
    conditions: [],
    data: { type: "conversation", npcId: "", dialogue: "", choices: [] },
    repeatable: false,
  };
}

// ─── メインコンポーネント ─────────────────────────────────────────────────
export default function MapEditorPage() {
  const { dispatch } = useGame();

  // グリッド
  const [selectedMapId, setSelectedMapId] = useState<string>(MAP_LIST[0].id);
  const [selectedTile, setSelectedTile] = useState<number>(0);
  const [grid, setGrid] = useState<number[][]>(() =>
    cloneGrid(MAP_MASTER_MAP[MAP_LIST[0].id]!.tileMap)
  );
  const [tool, setTool] = useState<Tool>("paint");
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  // Undo/Redo
  const histRef = useRef<number[][][]>([cloneGrid(MAP_MASTER_MAP[MAP_LIST[0].id]!.tileMap)]);
  const histIdxRef = useRef(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // ペイント用
  const isPainting = useRef(false);
  const strokeStartRef = useRef<number[][] | null>(null);

  // イベント
  const [events, setEvents] = useState<StoryEvent[]>(() =>
    JSON.parse(JSON.stringify(STORY_EVENT_MASTER)) as StoryEvent[]
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<StoryEvent | null>(null);
  const [movingEventId, setMovingEventId] = useState<string | null>(null);
  const [showEvents, setShowEvents] = useState(true);
  const [showNpcs, setShowNpcs] = useState(true);
  const [eventsSaveStatus, setEventsSaveStatus] = useState<"idle" | "saved">("idle");

  // ポータル（トランジション）
  const [transitions, setTransitions] = useState<Record<string, MapTransition[]>>(
    () => JSON.parse(JSON.stringify(MAP_TRANSITIONS))
  );
  const [editingPortal, setEditingPortal] = useState<MapTransition | null>(null);
  const [showPortals, setShowPortals] = useState(true);
  const [portalSaveStatus, setPortalSaveStatus] = useState<"idle" | "saved">("idle");

  // 追加マップ（mapMasterAdditions.json）
  const [additions, setAdditions] = useState<MapMasterAddition[]>(
    () => JSON.parse(JSON.stringify(MAP_ADDITIONS))
  );
  const [additionsSaveStatus, setAdditionsSaveStatus] = useState<"idle" | "saved">("idle");

  // 新規マップ作成ダイアログ
  const [showNewMapDialog, setShowNewMapDialog] = useState(false);
  const [newMapForm, setNewMapForm] = useState({
    name: "", emoji: "🗺️", description: "",
    rows: 20, cols: 20, baseLevel: 1, levelVariance: 3,
  });

  // ─── 派生 ───────────────────────────────────────────────────────────────
  const allMapList = useMemo(() => [
    ...MAP_LIST,
    ...additions.map(m => ({ id: m.id, name: m.name })),
  ], [additions]);

  const isAdditionMap = useMemo(
    () => additions.some(m => m.id === selectedMapId),
    [additions, selectedMapId]
  );

  const eventsOnMap = useMemo(
    () => events.filter(e => e.mapId === selectedMapId),
    [events, selectedMapId]
  );
  const npcsOnMap = useMemo(
    () => STORY_NPC_MASTER.filter(n => n.mapId === selectedMapId),
    [selectedMapId]
  );

  const eventMap = useMemo(() => {
    const m = new Map<string, StoryEvent[]>();
    eventsOnMap.forEach(e => {
      const k = `${e.position.row}-${e.position.col}`;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(e);
    });
    return m;
  }, [eventsOnMap]);

  const npcMap = useMemo(() => {
    const m = new Map<string, StoryNPC[]>();
    npcsOnMap.forEach(n => {
      const k = `${n.position.row}-${n.position.col}`;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(n);
    });
    return m;
  }, [npcsOnMap]);

  const portalMap = useMemo(() => {
    const m = new Map<string, MapTransition>();
    (transitions[selectedMapId] ?? []).forEach(t => {
      m.set(`${t.fromRow}-${t.fromCol}`, t);
    });
    return m;
  }, [transitions, selectedMapId]);

  const cellEvents = useMemo(() =>
    selectedCell ? (eventMap.get(`${selectedCell.row}-${selectedCell.col}`) ?? []) : [],
    [selectedCell, eventMap]
  );
  const cellNpcs = useMemo(() =>
    selectedCell ? (npcMap.get(`${selectedCell.row}-${selectedCell.col}`) ?? []) : [],
    [selectedCell, npcMap]
  );
  const cellPortal = useMemo(() =>
    selectedCell ? portalMap.get(`${selectedCell.row}-${selectedCell.col}`) ?? null : null,
    [selectedCell, portalMap]
  );

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  // ─── Undo/Redo ──────────────────────────────────────────────────────────
  const syncHistoryState = useCallback(() => {
    setCanUndo(histIdxRef.current > 0);
    setCanRedo(histIdxRef.current < histRef.current.length - 1);
  }, []);

  const pushHistory = useCallback((g: number[][]) => {
    histRef.current = histRef.current.slice(0, histIdxRef.current + 1);
    histRef.current.push(cloneGrid(g));
    histIdxRef.current = histRef.current.length - 1;
    syncHistoryState();
  }, [syncHistoryState]);

  const undo = useCallback(() => {
    if (histIdxRef.current > 0) {
      histIdxRef.current--;
      setGrid(cloneGrid(histRef.current[histIdxRef.current]));
      syncHistoryState();
    }
  }, [syncHistoryState]);

  const redo = useCallback(() => {
    if (histIdxRef.current < histRef.current.length - 1) {
      histIdxRef.current++;
      setGrid(cloneGrid(histRef.current[histIdxRef.current]));
      syncHistoryState();
    }
  }, [syncHistoryState]);

  // ─── マップ読み込み ──────────────────────────────────────────────────────
  const loadMap = useCallback((mapId: string) => {
    const addition = additions.find(m => m.id === mapId);
    const initial = addition
      ? cloneGrid(addition.tileMap)
      : cloneGrid(MAP_MASTER_MAP[mapId]!.tileMap);
    setSelectedMapId(mapId);
    setGrid(initial);
    histRef.current = [cloneGrid(initial)];
    histIdxRef.current = 0;
    syncHistoryState();
    setSaveStatus("idle");
    setSelectedCell(null);
    setSelectedEventId(null);
    setEditingEvent(null);
    setMovingEventId(null);
    setEditingPortal(null);
  }, [additions, syncHistoryState]);

  // ─── ペイント ────────────────────────────────────────────────────────────
  const paintCell = useCallback((r: number, c: number) => {
    setGrid(prev => {
      const next = cloneGrid(prev);
      next[r][c] = selectedTile;
      return next;
    });
    setSaveStatus("idle");
  }, [selectedTile]);

  const handleMouseDown = (r: number, c: number) => {
    if (movingEventId) {
      // イベント移動モード: このセルに移動
      setEvents(prev => prev.map(e =>
        e.id === movingEventId ? { ...e, position: { row: r, col: c } } : e
      ));
      if (editingEvent?.id === movingEventId) {
        setEditingEvent(prev => prev ? { ...prev, position: { row: r, col: c } } : prev);
      }
      setMovingEventId(null);
      setSelectedCell({ row: r, col: c });
      return;
    }
    if (tool === "select") {
      setSelectedCell({ row: r, col: c });
      return;
    }
    if (tool === "fill") {
      const filled = floodFill(grid, r, c, selectedTile);
      setGrid(filled);
      pushHistory(filled);
      setSaveStatus("idle");
      return;
    }
    // paint
    isPainting.current = true;
    strokeStartRef.current = cloneGrid(grid);
    paintCell(r, c);
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (tool === "paint" && isPainting.current) paintCell(r, c);
  };

  const handleMouseUp = useCallback(() => {
    if (isPainting.current && strokeStartRef.current) {
      setGrid(current => {
        pushHistory(current);
        return current;
      });
    }
    isPainting.current = false;
    strokeStartRef.current = null;
  }, [pushHistory]);

  // ─── キーボードショートカット ────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tgt = e.target as HTMLElement;
      if (tgt.tagName === "INPUT" || tgt.tagName === "TEXTAREA" || tgt.isContentEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); undo(); }
      else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "z"))) { e.preventDefault(); redo(); }
      else if (e.key >= "0" && e.key <= "9") {
        const id = parseInt(e.key);
        if (MAP_TILE_MASTER[id]) setSelectedTile(id);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  // ─── CSV保存 ─────────────────────────────────────────────────────────────
  const downloadCsv = () => {
    const num = selectedMapId.replace(/^map-0*/, "").padStart(3, "0");
    const blob = new Blob([toCsv(grid)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `map-${num}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const overwriteCsv = async () => {
    const num = selectedMapId.replace(/^map-0*/, "").padStart(3, "0");
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as unknown as { showSaveFilePicker: (o: object) => Promise<FileSystemFileHandle> })
          .showSaveFilePicker({ suggestedName: `map-${num}.csv`, types: [{ description: "CSV", accept: { "text/csv": [".csv"] } }] });
        const w = await handle.createWritable();
        await w.write(toCsv(grid)); await w.close();
        setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 2500);
      } catch { /* cancel */ }
    } else { downloadCsv(); }
  };

  // ─── イベント編集 ────────────────────────────────────────────────────────
  const selectEvent = (evt: StoryEvent) => {
    setSelectedEventId(evt.id);
    setEditingEvent(JSON.parse(JSON.stringify(evt)));
  };

  const saveEventEdit = () => {
    if (!editingEvent) return;
    setEvents(prev => prev.map(e => e.id === editingEvent.id ? editingEvent : e));
    setSelectedEventId(editingEvent.id);
  };

  const deleteEvent = () => {
    if (!editingEvent) return;
    setEvents(prev => prev.filter(e => e.id !== editingEvent.id));
    setEditingEvent(null); setSelectedEventId(null);
  };

  const addEvent = () => {
    if (!selectedCell) return;
    const newEvt = makeNewEvent(selectedMapId, selectedCell.row, selectedCell.col);
    setEvents(prev => [...prev, newEvt]);
    selectEvent(newEvt);
  };

  const exportEvents = async () => {
    const json = JSON.stringify(events, null, 2);
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as unknown as { showSaveFilePicker: (o: object) => Promise<FileSystemFileHandle> })
          .showSaveFilePicker({ suggestedName: "storyEvents.json", types: [{ description: "JSON", accept: { "application/json": [".json"] } }] });
        const w = await handle.createWritable();
        await w.write(json); await w.close();
        setEventsSaveStatus("saved"); setTimeout(() => setEventsSaveStatus("idle"), 2500);
      } catch { /* cancel */ }
    } else {
      await navigator.clipboard.writeText(json);
      setEventsSaveStatus("saved"); setTimeout(() => setEventsSaveStatus("idle"), 2500);
    }
  };

  // ─── ポータル編集 ────────────────────────────────────────────────────────
  const startAddPortal = () => {
    if (!selectedCell) return;
    setEditingPortal({
      fromRow: selectedCell.row,
      fromCol: selectedCell.col,
      toMapId: "map-001",
      toRow: 0,
      toCol: 0,
      label: "🚪 …へ",
      showOnWorldMap: true,
    });
  };

  const savePortalEdit = () => {
    if (!editingPortal) return;
    setTransitions(prev => {
      const list = (prev[selectedMapId] ?? []).filter(
        t => !(t.fromRow === editingPortal.fromRow && t.fromCol === editingPortal.fromCol)
      );
      return { ...prev, [selectedMapId]: [...list, editingPortal] };
    });
    setEditingPortal(null);
  };

  const deletePortal = (fromRow: number, fromCol: number) => {
    setTransitions(prev => ({
      ...prev,
      [selectedMapId]: (prev[selectedMapId] ?? []).filter(
        t => !(t.fromRow === fromRow && t.fromCol === fromCol)
      ),
    }));
    setEditingPortal(null);
  };

  const exportPortals = async () => {
    const json = JSON.stringify(transitions, null, 2);
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as unknown as { showSaveFilePicker: (o: object) => Promise<FileSystemFileHandle> })
          .showSaveFilePicker({ suggestedName: "mapTransitions.json", types: [{ description: "JSON", accept: { "application/json": [".json"] } }] });
        const w = await handle.createWritable();
        await w.write(json); await w.close();
        setPortalSaveStatus("saved"); setTimeout(() => setPortalSaveStatus("idle"), 2500);
      } catch { /* cancel */ }
    } else {
      await navigator.clipboard.writeText(json);
      setPortalSaveStatus("saved"); setTimeout(() => setPortalSaveStatus("idle"), 2500);
    }
  };

  // ─── 新規マップ作成 ──────────────────────────────────────────────────────
  const createNewMap = () => {
    const { name, emoji, description, rows: r, cols: c, baseLevel, levelVariance } = newMapForm;
    if (!name.trim()) return;
    const allIds = [...MAP_LIST.map(m => m.id), ...additions.map(m => m.id)];
    const newId = generateNewMapId(allIds);
    const blankGrid = makeBlankGrid(r, c);
    const newMap: MapMasterAddition = {
      id: newId,
      name: name.trim(),
      description,
      emoji,
      enemySpawnTiles: [TileType.GRASS] as unknown as never,
      enemyIds: [],
      baseLevel,
      levelVariance,
      defaultPos: { row: 0, col: 0 },
      tileMap: blankGrid,
    };
    setAdditions(prev => [...prev, newMap]);

    // 新マップをすぐにロード（additionsステート更新前なので直接セット）
    const initial = cloneGrid(blankGrid);
    setSelectedMapId(newId);
    setGrid(initial);
    histRef.current = [cloneGrid(initial)];
    histIdxRef.current = 0;
    syncHistoryState();
    setSaveStatus("idle");
    setSelectedCell(null);
    setSelectedEventId(null);
    setEditingEvent(null);
    setMovingEventId(null);
    setEditingPortal(null);

    setShowNewMapDialog(false);
    setNewMapForm({ name: "", emoji: "🗺️", description: "", rows: 20, cols: 20, baseLevel: 1, levelVariance: 3 });
  };

  const exportAdditions = async () => {
    // 現在編集中のマップが追加マップなら最新グリッドを反映
    const updated = additions.map(m =>
      m.id === selectedMapId ? { ...m, tileMap: grid } : m
    );
    const json = JSON.stringify(updated, null, 2);
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as unknown as { showSaveFilePicker: (o: object) => Promise<FileSystemFileHandle> })
          .showSaveFilePicker({ suggestedName: "mapMasterAdditions.json", types: [{ description: "JSON", accept: { "application/json": [".json"] } }] });
        const w = await handle.createWritable();
        await w.write(json); await w.close();
        setAdditionsSaveStatus("saved"); setTimeout(() => setAdditionsSaveStatus("idle"), 2500);
      } catch { /* cancel */ }
    } else {
      await navigator.clipboard.writeText(json);
      setAdditionsSaveStatus("saved"); setTimeout(() => setAdditionsSaveStatus("idle"), 2500);
    }
  };

  // ─── 静的マップへ昇格 ────────────────────────────────────────────────────
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [promoteDone, setPromoteDone] = useState(false);

  const promoteToStatic = async () => {
    const mapNum = selectedMapId.replace(/^map-/, ""); // "019"
    const filename = `map-${mapNum}.csv`;
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as unknown as { showSaveFilePicker: (o: object) => Promise<FileSystemFileHandle> })
          .showSaveFilePicker({
            suggestedName: filename,
            types: [{ description: "CSV", accept: { "text/csv": [".csv"] } }],
          });
        const w = await handle.createWritable();
        await w.write(toCsv(grid));
        await w.close();
        setPromoteDone(true);
        setShowPromoteDialog(true);
      } catch { /* cancel */ }
    } else {
      downloadCsv();
      setPromoteDone(true);
      setShowPromoteDialog(true);
    }
  };

  const removeFromAdditions = () => {
    setAdditions(prev => prev.filter(m => m.id !== selectedMapId));
    loadMap(MAP_LIST[0].id);
    setShowPromoteDialog(false);
  };

  const currentAddition = additions.find(m => m.id === selectedMapId) ?? null;
  const promoteSnippets = currentAddition ? buildPromoteSnippets(currentAddition) : null;

  // ─── レンダリング ────────────────────────────────────────────────────────
  const selectedTileInfo = MAP_TILE_MASTER[selectedCell ? grid[selectedCell.row]?.[selectedCell.col] ?? 0 : 0];

  return (
    <Box
      sx={{ display: "flex", height: "100vh", bgcolor: "#0e0e1c", color: "#eee", userSelect: "none", overflow: "hidden" }}
      onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
    >
      {/* ── 左パネル ── */}
      <Box sx={{ width: 230, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: "1px solid #2a2a3e", bgcolor: "#13132a" }}>
        <Box sx={{ p: 1.5, borderBottom: "1px solid #2a2a3e" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <IconButton size="small" onClick={() => dispatch({ type: "SET_SCENE", payload: "debug" })} sx={{ color: "#888" }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 14 }}>マップエディタ</Typography>
          </Box>

          {/* マップ選択 */}
          <Box sx={{ display: "flex", gap: 0.5, mb: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: 12 }}>マップ</InputLabel>
              <Select value={selectedMapId} label="マップ" onChange={e => loadMap(e.target.value)} sx={{ fontSize: 12 }}>
                {MAP_LIST.map(m => (
                  <MenuItem key={m.id} value={m.id} sx={{ fontSize: 12 }}>{m.id} {m.name}</MenuItem>
                ))}
                {additions.length > 0 && <Divider />}
                {additions.map(m => (
                  <MenuItem key={m.id} value={m.id} sx={{ fontSize: 12, color: "#ff9800" }}>
                    ✦ {m.id} {m.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="新規マップ作成">
              <IconButton size="small" onClick={() => setShowNewMapDialog(true)}
                sx={{ color: "#ff9800", border: "1px solid rgba(255,152,0,0.4)", borderRadius: 1, flexShrink: 0 }}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* ツール */}
          <ToggleButtonGroup value={tool} exclusive onChange={(_, v) => v && setTool(v)} size="small" fullWidth>
            <Tooltip title="ペイント (P)"><ToggleButton value="paint"><BrushIcon fontSize="small" /></ToggleButton></Tooltip>
            <Tooltip title="塗りつぶし (F)"><ToggleButton value="fill"><FormatColorFillIcon fontSize="small" /></ToggleButton></Tooltip>
            <Tooltip title="選択 (クリックで情報)"><ToggleButton value="select"><MouseIcon fontSize="small" /></ToggleButton></Tooltip>
          </ToggleButtonGroup>
        </Box>

        {/* タイルパレット */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
          <Typography variant="caption" sx={{ color: "#666", display: "block", mb: 0.5 }}>タイル (0〜9キー)</Typography>
          {TILE_IDS.map(id => {
            const tile = MAP_TILE_MASTER[id];
            return (
              <Box key={id} onClick={() => setSelectedTile(id)} sx={{
                display: "flex", alignItems: "center", gap: 0.75, p: "3px 6px", borderRadius: 0.5,
                cursor: "pointer",
                border: selectedTile === id ? "1.5px solid #7c4dff" : "1.5px solid transparent",
                bgcolor: selectedTile === id ? "rgba(124,77,255,0.15)" : "transparent",
                "&:hover": { bgcolor: "rgba(124,77,255,0.08)" },
              }}>
                <Box sx={{ width: 16, height: 16, borderRadius: "2px", bgcolor: tile.color, flexShrink: 0 }} />
                <Typography variant="caption">[{id}] {tile.name}</Typography>
              </Box>
            );
          })}
        </Box>

        {/* 保存ボタン */}
        <Box sx={{ p: 1.5, borderTop: "1px solid #2a2a3e", display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Button variant="contained" size="small" startIcon={<UndoIcon />} onClick={undo} disabled={!canUndo} sx={{ flex: 1, fontSize: 11 }}>元に戻す</Button>
            <Button variant="outlined" size="small" startIcon={<RedoIcon />} onClick={redo} disabled={!canRedo} sx={{ flex: 1, fontSize: 11 }}>やり直し</Button>
          </Box>
          {isAdditionMap ? (
            <>
              <Button variant="outlined" size="small"
                color={additionsSaveStatus === "saved" ? "success" : "warning"}
                startIcon={<SaveIcon />} onClick={exportAdditions} fullWidth sx={{ fontSize: 11 }}>
                {additionsSaveStatus === "saved" ? "保存済" : "作業中を保存"}
              </Button>
              <Button variant="contained" size="small" color="warning"
                startIcon={<UpgradeIcon />} onClick={promoteToStatic} fullWidth sx={{ fontSize: 11, fontWeight: 700 }}>
                静的マップに昇格 →
              </Button>
            </>
          ) : (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Button variant="contained" size="small" color={saveStatus === "saved" ? "success" : "warning"} startIcon={<SaveIcon />} onClick={overwriteCsv} sx={{ flex: 1, fontSize: 11 }}>
                {saveStatus === "saved" ? "保存済" : "上書保存"}
              </Button>
              <Tooltip title="CSVダウンロード">
                <IconButton size="small" onClick={downloadCsv} sx={{ color: "#888", border: "1px solid #333" }}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          <Typography variant="caption" sx={{ color: "#444", textAlign: "center" }}>
            {rows}×{cols} Ctrl+Z/Y: Undo/Redo
          </Typography>
        </Box>
      </Box>

      {/* ── グリッドエリア ── */}
      <Box sx={{ flex: 1, overflow: "auto", p: 1, display: "flex", flexDirection: "column" }}>
        {/* 移動モードバナー */}
        {movingEventId && (
          <Paper elevation={0} sx={{ p: 1, mb: 1, bgcolor: "rgba(255,215,64,0.15)", border: "1px solid #ffd740", display: "flex", alignItems: "center", gap: 1, borderRadius: 1 }}>
            <OpenWithIcon sx={{ fontSize: 16, color: "#ffd740" }} />
            <Typography variant="caption" sx={{ color: "#ffd740", flex: 1 }}>
              移動先セルをクリック: {events.find(e => e.id === movingEventId)?.name}
            </Typography>
            <Button size="small" onClick={() => setMovingEventId(null)} sx={{ fontSize: 10, py: 0 }}>キャンセル</Button>
          </Paper>
        )}

        {/* オーバーレイトグル */}
        <Box sx={{ display: "flex", gap: 2, mb: 0.5, alignItems: "center" }}>
          <FormControlLabel control={<Switch size="small" checked={showEvents} onChange={e => setShowEvents(e.target.checked)} color="warning" />} label={<Typography variant="caption">イベント</Typography>} />
          <FormControlLabel control={<Switch size="small" checked={showNpcs} onChange={e => setShowNpcs(e.target.checked)} color="info" />} label={<Typography variant="caption">NPC</Typography>} />
          <FormControlLabel control={<Switch size="small" checked={showPortals} onChange={e => setShowPortals(e.target.checked)} color="success" />} label={<Typography variant="caption">ポータル</Typography>} />
          <Typography variant="caption" sx={{ color: "#555", ml: "auto" }}>
            {selectedMapId} — {MAP_MASTER_MAP[selectedMapId]?.name}
          </Typography>
        </Box>

        {/* グリッド本体 */}
        <Box sx={{ display: "inline-block" }}>
          {/* 列番号 */}
          <Box sx={{ display: "flex", ml: `${CELL_SIZE}px` }}>
            {Array.from({ length: cols }, (_, c) => (
              <Box key={c} sx={{ width: CELL_SIZE, textAlign: "center", fontSize: 8, color: c % 5 === 0 ? "#666" : "transparent", flexShrink: 0 }}>
                {c}
              </Box>
            ))}
          </Box>
          {/* 行 */}
          {grid.map((row, r) => (
            <Box key={r} sx={{ display: "flex", alignItems: "center" }}>
              {/* 行番号 */}
              <Box sx={{ width: CELL_SIZE, textAlign: "right", pr: 0.5, fontSize: 8, color: r % 5 === 0 ? "#666" : "transparent", flexShrink: 0 }}>
                {r}
              </Box>
              {row.map((tileId, c) => {
                const tile = MAP_TILE_MASTER[tileId];
                const cellKey = `${r}-${c}`;
                const evts = showEvents ? (eventMap.get(cellKey) ?? []) : [];
                const npcs = showNpcs ? (npcMap.get(cellKey) ?? []) : [];
                const portal = showPortals ? portalMap.get(cellKey) : undefined;
                const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                const movingEvt = movingEventId ? events.find(e => e.id === movingEventId) : null;

                const tooltipParts: string[] = [`(${r},${c}) ${tile?.name ?? tileId}`];
                evts.forEach(e => tooltipParts.push(`▶ ${e.name} [${e.trigger}]`));
                npcs.forEach(n => tooltipParts.push(`● NPC: ${n.name}`));
                if (portal) tooltipParts.push(`🚪 → ${portal.toMapId} (${portal.toRow},${portal.toCol})`);

                return (
                  <Tooltip key={c} title={<span style={{ whiteSpace: "pre-line" }}>{tooltipParts.join("\n")}</span>} placement="top" disableInteractive arrow={false}>
                    <Box
                      onMouseDown={() => handleMouseDown(r, c)}
                      onMouseEnter={() => handleMouseEnter(r, c)}
                      sx={{
                        position: "relative",
                        width: CELL_SIZE, height: CELL_SIZE,
                        bgcolor: tile?.color ?? "#333",
                        boxSizing: "border-box",
                        border: isSelected ? "2px solid #fff" : "0.5px solid rgba(0,0,0,0.35)",
                        outline: movingEvt ? "1.5px dashed #ffd740" : "none",
                        cursor: movingEventId ? "crosshair" : tool === "select" ? "pointer" : "crosshair",
                        zIndex: isSelected ? 2 : 0,
                        "&:hover": { outline: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.5)", zIndex: 1 },
                      }}
                    >
                      {/* イベントマーカー (右上) */}
                      {evts.length > 0 && (
                        <Box sx={{
                          position: "absolute", top: 1, right: 1,
                          width: 7, height: 7, borderRadius: "50%",
                          bgcolor: evts.length > 1 ? "#ff6b6b" : TRIGGER_COLOR[evts[0].trigger],
                          border: "0.5px solid rgba(0,0,0,0.5)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 6, fontWeight: 700, color: "#000", lineHeight: 1, pointerEvents: "none",
                        }}>
                          {evts.length > 1 ? evts.length : ""}
                        </Box>
                      )}
                      {/* NPCマーカー (左上) */}
                      {npcs.length > 0 && (
                        <Box sx={{
                          position: "absolute", top: 1, left: 1,
                          width: 7, height: 7, borderRadius: "1px",
                          bgcolor: "#00e5ff",
                          border: "0.5px solid rgba(0,0,0,0.5)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 6, fontWeight: 700, color: "#000", lineHeight: 1, pointerEvents: "none",
                        }}>
                          {npcs.length > 1 ? npcs.length : ""}
                        </Box>
                      )}
                      {/* ポータルマーカー (左下) */}
                      {portal && (
                        <Box sx={{
                          position: "absolute", bottom: 1, left: 1,
                          width: 7, height: 7, borderRadius: "50%",
                          bgcolor: "#ff9800",
                          border: "0.5px solid rgba(0,0,0,0.5)",
                          pointerEvents: "none",
                        }} />
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── 右パネル ── */}
      <Box sx={{ width: 290, flexShrink: 0, borderLeft: "1px solid #2a2a3e", bgcolor: "#13132a", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selectedCell ? (
          <>
            {/* セル情報 */}
            <Box sx={{ p: 1.5, borderBottom: "1px solid #2a2a3e" }}>
              <Typography variant="subtitle2" sx={{ color: "#aaa", fontSize: 11, mb: 0.5 }}>選択セル</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 20, height: 20, borderRadius: "3px", bgcolor: selectedTileInfo?.color ?? "#333", border: "1px solid #555", flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    ({selectedCell.row}, {selectedCell.col})
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#888" }}>
                    {selectedTileInfo?.name ?? "不明"} {selectedTileInfo?.walkable ? "（通行可）" : "（通行不可）"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* イベントリスト */}
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              <Box sx={{ p: 1.5 }}>
                {/* このセルのイベント */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "#ffd740" }}>
                    イベント ({cellEvents.length})
                  </Typography>
                  <Button size="small" startIcon={<AddIcon sx={{ fontSize: 12 }} />} onClick={addEvent} sx={{ fontSize: 10, py: 0, color: "#ffd740" }}>
                    追加
                  </Button>
                </Box>
                {cellEvents.map(evt => (
                  <Box key={evt.id} onClick={() => selectEvent(evt)} sx={{
                    p: "4px 8px", borderRadius: 0.5, cursor: "pointer", mb: 0.5,
                    border: `1px solid ${selectedEventId === evt.id ? TRIGGER_COLOR[evt.trigger] : "rgba(255,215,64,0.2)"}`,
                    bgcolor: selectedEventId === evt.id ? "rgba(255,215,64,0.1)" : "transparent",
                    "&:hover": { bgcolor: "rgba(255,215,64,0.08)" },
                  }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: TRIGGER_COLOR[evt.trigger], flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ flex: 1, fontWeight: 600 }}>{evt.name}</Typography>
                      <Chip label={evt.trigger} size="small" sx={{ height: 14, fontSize: 9, "& .MuiChip-label": { px: 0.5 } }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: "#666", display: "block", fontSize: 10, ml: 1.5 }}>{evt.id}</Typography>
                  </Box>
                ))}

                {/* NPC */}
                {cellNpcs.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: "#00e5ff", display: "block", mb: 0.5 }}>NPC ({cellNpcs.length})</Typography>
                    {cellNpcs.map(npc => (
                      <Box key={npc.id} sx={{ p: "4px 8px", borderRadius: 0.5, border: "1px solid rgba(0,229,255,0.2)", mb: 0.5 }}>
                        <Typography variant="caption">{npc.emoji} {npc.name}</Typography>
                        <Typography variant="caption" sx={{ color: "#666", display: "block", fontSize: 10 }}>{npc.id}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}

                {/* ポータル */}
                <Box sx={{ mt: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" sx={{ color: "#ff9800" }}>
                      ポータル {cellPortal ? "● あり" : "○ なし"}
                    </Typography>
                    {!cellPortal && !editingPortal && (
                      <Button size="small" startIcon={<AddIcon sx={{ fontSize: 12 }} />} onClick={startAddPortal} sx={{ fontSize: 10, py: 0, color: "#ff9800" }}>
                        追加
                      </Button>
                    )}
                  </Box>
                  {cellPortal && !editingPortal && (
                    <Box sx={{ p: "4px 8px", borderRadius: 0.5, border: "1px solid rgba(255,152,0,0.4)", mb: 0.5, bgcolor: "rgba(255,152,0,0.05)" }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: "block" }}>
                        → {MAP_MASTER_MAP[cellPortal.toMapId]?.emoji} {MAP_MASTER_MAP[cellPortal.toMapId]?.name ?? cellPortal.toMapId}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#888", display: "block", fontSize: 10 }}>
                        ({cellPortal.toRow}, {cellPortal.toCol}) {cellPortal.showOnWorldMap === false ? "地図非表示" : ""}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#666", display: "block", fontSize: 10, fontStyle: "italic" }}>
                        {cellPortal.label}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                        <Button size="small" onClick={() => setEditingPortal({ ...cellPortal })} sx={{ fontSize: 10, py: 0, color: "#ff9800" }}>編集</Button>
                        <Button size="small" color="error" onClick={() => deletePortal(cellPortal.fromRow, cellPortal.fromCol)} sx={{ fontSize: 10, py: 0 }}>削除</Button>
                      </Box>
                    </Box>
                  )}
                  {editingPortal && editingPortal.fromRow === selectedCell?.row && editingPortal.fromCol === selectedCell?.col && (
                    <Box sx={{ p: 1, borderRadius: 0.5, border: "1px solid rgba(255,152,0,0.5)", bgcolor: "rgba(255,152,0,0.07)", display: "flex", flexDirection: "column", gap: 0.75 }}>
                      <Typography variant="caption" sx={{ color: "#ff9800", fontWeight: 700 }}>ポータル設定</Typography>
                      <FormControl size="small" fullWidth>
                        <InputLabel sx={{ fontSize: 11 }}>接続先マップ</InputLabel>
                        <Select value={editingPortal.toMapId} label="接続先マップ" sx={{ fontSize: 11 }}
                          onChange={e => setEditingPortal(p => p ? { ...p, toMapId: e.target.value } : p)}>
                          {MAP_LIST.filter(m => m.id !== selectedMapId).map(m => (
                            <MenuItem key={m.id} value={m.id} sx={{ fontSize: 11 }}>{m.id} {m.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <TextField label="到着Row" type="number" size="small" sx={{ flex: 1 }}
                          value={editingPortal.toRow}
                          InputLabelProps={{ sx: { fontSize: 10 } }} inputProps={{ style: { fontSize: 11 }, min: 0 }}
                          onChange={e => setEditingPortal(p => p ? { ...p, toRow: Number(e.target.value) } : p)} />
                        <TextField label="到着Col" type="number" size="small" sx={{ flex: 1 }}
                          value={editingPortal.toCol}
                          InputLabelProps={{ sx: { fontSize: 10 } }} inputProps={{ style: { fontSize: 11 }, min: 0 }}
                          onChange={e => setEditingPortal(p => p ? { ...p, toCol: Number(e.target.value) } : p)} />
                      </Box>
                      <TextField label="ラベル" size="small" fullWidth
                        value={editingPortal.label}
                        InputLabelProps={{ sx: { fontSize: 11 } }} inputProps={{ style: { fontSize: 11 } }}
                        onChange={e => setEditingPortal(p => p ? { ...p, label: e.target.value } : p)} />
                      <FormControlLabel
                        control={<Switch size="small" checked={editingPortal.showOnWorldMap !== false}
                          onChange={e => setEditingPortal(p => p ? { ...p, showOnWorldMap: e.target.checked } : p)} />}
                        label={<Typography variant="caption" sx={{ fontSize: 10 }}>世界地図に接続線表示</Typography>}
                      />
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Button size="small" variant="contained" color="warning" onClick={savePortalEdit} sx={{ flex: 1, fontSize: 10 }}>保存</Button>
                        <Button size="small" onClick={() => setEditingPortal(null)} sx={{ flex: 1, fontSize: 10, color: "#888" }}>キャンセル</Button>
                      </Box>
                    </Box>
                  )}
                </Box>

                <Divider sx={{ my: 1, borderColor: "#2a2a3e" }} />

                {/* イベント編集フォーム */}
                {editingEvent && (
                  <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #2a2a3e" }}>
                    <Typography variant="caption" sx={{ color: "#ffd740", display: "block", mb: 1, fontWeight: 700 }}>
                      編集: {editingEvent.id}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <TextField label="名前" value={editingEvent.name} size="small" fullWidth
                        InputLabelProps={{ sx: { fontSize: 12 } }} inputProps={{ style: { fontSize: 12 } }}
                        onChange={e => setEditingEvent(prev => prev ? { ...prev, name: e.target.value } : prev)} />
                      <TextField label="説明" value={editingEvent.description} size="small" fullWidth multiline rows={2}
                        InputLabelProps={{ sx: { fontSize: 12 } }} inputProps={{ style: { fontSize: 11 } }}
                        onChange={e => setEditingEvent(prev => prev ? { ...prev, description: e.target.value } : prev)} />
                      <FormControl size="small" fullWidth>
                        <InputLabel sx={{ fontSize: 12 }}>トリガー</InputLabel>
                        <Select value={editingEvent.trigger} label="トリガー" sx={{ fontSize: 12 }}
                          onChange={e => setEditingEvent(prev => prev ? { ...prev, trigger: e.target.value as "step" | "interact" } : prev)}>
                          <MenuItem value="step">step（踏む）</MenuItem>
                          <MenuItem value="interact">interact（話す）</MenuItem>
                        </Select>
                      </FormControl>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <TextField label="Row" type="number" value={editingEvent.position.row} size="small" sx={{ flex: 1 }}
                          InputLabelProps={{ sx: { fontSize: 11 } }} inputProps={{ style: { fontSize: 12 }, min: 0, max: rows - 1 }}
                          onChange={e => setEditingEvent(prev => prev ? { ...prev, position: { ...prev.position, row: Number(e.target.value) } } : prev)} />
                        <TextField label="Col" type="number" value={editingEvent.position.col} size="small" sx={{ flex: 1 }}
                          InputLabelProps={{ sx: { fontSize: 11 } }} inputProps={{ style: { fontSize: 12 }, min: 0, max: cols - 1 }}
                          onChange={e => setEditingEvent(prev => prev ? { ...prev, position: { ...prev.position, col: Number(e.target.value) } } : prev)} />
                      </Box>
                      <TextField label="Chapter" type="number" value={editingEvent.chapter} size="small" fullWidth
                        InputLabelProps={{ sx: { fontSize: 12 } }} inputProps={{ style: { fontSize: 12 }, min: 0 }}
                        onChange={e => setEditingEvent(prev => prev ? { ...prev, chapter: Number(e.target.value) } : prev)} />
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Button size="small" variant="outlined" color="warning" startIcon={<OpenWithIcon sx={{ fontSize: 12 }} />}
                          onClick={() => setMovingEventId(editingEvent.id)} sx={{ flex: 1, fontSize: 10 }}>
                          地図上で移動
                        </Button>
                        <Button size="small" variant="contained" onClick={saveEventEdit} sx={{ flex: 1, fontSize: 10 }}>
                          保存
                        </Button>
                      </Box>
                      <Button size="small" color="error" startIcon={<DeleteIcon sx={{ fontSize: 12 }} />} onClick={deleteEvent} sx={{ fontSize: 10 }}>
                        イベント削除
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#444", gap: 1 }}>
            <MouseIcon sx={{ fontSize: 32 }} />
            <Typography variant="caption" sx={{ textAlign: "center", px: 2 }}>
              セルをクリックして<br />情報を表示
            </Typography>
          </Box>
        )}

        {/* イベント凡例 + エクスポート */}
        <Box sx={{ p: 1.5, borderTop: "1px solid #2a2a3e" }}>
          <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: TRIGGER_COLOR.step }} />
              <Typography variant="caption" sx={{ color: "#666", fontSize: 10 }}>step</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: TRIGGER_COLOR.interact }} />
              <Typography variant="caption" sx={{ color: "#666", fontSize: 10 }}>interact</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "1px", bgcolor: "#00e5ff" }} />
              <Typography variant="caption" sx={{ color: "#666", fontSize: 10 }}>NPC</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#ff9800" }} />
              <Typography variant="caption" sx={{ color: "#666", fontSize: 10 }}>ポータル</Typography>
            </Box>
          </Box>
          <Typography variant="caption" sx={{ color: "#555", display: "block", mb: 0.5 }}>
            {isAdditionMap && <Box component="span" sx={{ color: "#ff9800" }}>✦ 追加マップ　</Box>}
            {rows}×{cols}　イベント {eventsOnMap.length} / NPC {npcsOnMap.length} / ポータル {(transitions[selectedMapId] ?? []).length}
          </Typography>
          <Button fullWidth size="small" variant="outlined" color={eventsSaveStatus === "saved" ? "success" : "primary"}
            onClick={exportEvents} sx={{ fontSize: 11, mb: 0.5 }}>
            {eventsSaveStatus === "saved" ? "保存完了" : "イベントJSON書き出し"}
          </Button>
          <Button fullWidth size="small" variant="outlined" color={portalSaveStatus === "saved" ? "success" : "warning"}
            onClick={exportPortals} sx={{ fontSize: 11 }}>
            {portalSaveStatus === "saved" ? "保存完了" : "ポータルJSON書き出し"}
          </Button>
        </Box>
      </Box>

      {/* ── 静的マップ昇格ダイアログ ── */}
      <Dialog open={showPromoteDialog} onClose={() => setShowPromoteDialog(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: "#0d0d1a", border: "1px solid rgba(255,152,0,0.5)", borderRadius: 2 } }}>
        <DialogTitle sx={{ fontSize: 14, fontWeight: 700, pb: 1 }}>
          ▲ 静的マップへ昇格 — {selectedMapId}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "4px !important" }}>
          {promoteDone && (
            <Typography variant="caption" sx={{ color: "#4caf50", fontWeight: 700 }}>
              ✓ {promoteSnippets?.csvFile} を保存しました。src/data/maps/ フォルダに配置してください。
            </Typography>
          )}

          {/* mapCellMaster.ts スニペット */}
          {promoteSnippets && (
            <>
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "#ff9800", fontWeight: 700 }}>
                    ① mapCellMaster.ts に追加
                  </Typography>
                  <Tooltip title="コピー">
                    <IconButton size="small" onClick={() => navigator.clipboard.writeText(promoteSnippets.cellMasterSnippet)}
                      sx={{ color: "#888", p: 0.25 }}>
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box component="pre" sx={{
                  m: 0, p: 1, bgcolor: "#080810", borderRadius: 1,
                  border: "1px solid #2a2a3e", fontSize: 11, fontFamily: "monospace",
                  color: "#a8d8a8", overflowX: "auto", whiteSpace: "pre-wrap",
                }}>
                  {promoteSnippets.cellMasterSnippet}
                </Box>
              </Box>

              {/* mapMaster.ts スニペット */}
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: "#ff9800", fontWeight: 700 }}>
                    ② mapMaster.ts の STATIC_MAP_MASTER 末尾に追加
                  </Typography>
                  <Tooltip title="コピー">
                    <IconButton size="small" onClick={() => navigator.clipboard.writeText(promoteSnippets.mapEntry)}
                      sx={{ color: "#888", p: 0.25 }}>
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box component="pre" sx={{
                  m: 0, p: 1, bgcolor: "#080810", borderRadius: 1,
                  border: "1px solid #2a2a3e", fontSize: 11, fontFamily: "monospace",
                  color: "#a8d8a8", overflowX: "auto", whiteSpace: "pre-wrap",
                }}>
                  {promoteSnippets.mapEntry}
                </Box>
              </Box>

              <Box sx={{ p: 1, bgcolor: "rgba(255,152,0,0.05)", border: "1px solid rgba(255,152,0,0.2)", borderRadius: 1 }}>
                <Typography variant="caption" sx={{ color: "#aaa" }}>
                  ③ 上記のコードを追加後、<strong style={{ color: "#ff9800" }}>「追加データから削除」</strong>を押してください。
                  削除前はまだ additions から読み込まれます。
                </Typography>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button onClick={() => setShowPromoteDialog(false)} sx={{ color: "#888", fontSize: 12 }}>閉じる</Button>
          <Button variant="outlined" color="error" onClick={removeFromAdditions} sx={{ fontSize: 12 }}>
            追加データから削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── 新規マップ作成ダイアログ ── */}
      <Dialog open={showNewMapDialog} onClose={() => setShowNewMapDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { bgcolor: "#0d0d1a", border: "1px solid rgba(255,152,0,0.4)", borderRadius: 2 } }}>
        <DialogTitle sx={{ fontSize: 15, fontWeight: 700, pb: 1 }}>
          ✦ 新規マップ作成
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: "8px !important" }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField label="絵文字" size="small" sx={{ width: 80 }}
              value={newMapForm.emoji}
              InputLabelProps={{ sx: { fontSize: 12 } }} inputProps={{ style: { fontSize: 16, textAlign: "center" } }}
              onChange={e => setNewMapForm(p => ({ ...p, emoji: e.target.value }))} />
            <TextField label="マップ名 *" size="small" sx={{ flex: 1 }}
              value={newMapForm.name}
              InputLabelProps={{ sx: { fontSize: 12 } }} inputProps={{ style: { fontSize: 13 } }}
              onChange={e => setNewMapForm(p => ({ ...p, name: e.target.value }))} />
          </Box>
          <TextField label="説明" size="small" fullWidth multiline rows={2}
            value={newMapForm.description}
            InputLabelProps={{ sx: { fontSize: 12 } }} inputProps={{ style: { fontSize: 12 } }}
            onChange={e => setNewMapForm(p => ({ ...p, description: e.target.value }))} />
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField label="行数" type="number" size="small" sx={{ flex: 1 }}
              value={newMapForm.rows}
              InputLabelProps={{ sx: { fontSize: 11 } }} inputProps={{ style: { fontSize: 12 }, min: 5, max: 40 }}
              onChange={e => setNewMapForm(p => ({ ...p, rows: Math.max(5, Math.min(40, Number(e.target.value))) }))} />
            <TextField label="列数" type="number" size="small" sx={{ flex: 1 }}
              value={newMapForm.cols}
              InputLabelProps={{ sx: { fontSize: 11 } }} inputProps={{ style: { fontSize: 12 }, min: 5, max: 40 }}
              onChange={e => setNewMapForm(p => ({ ...p, cols: Math.max(5, Math.min(40, Number(e.target.value))) }))} />
            <TextField label="基準Lv" type="number" size="small" sx={{ flex: 1 }}
              value={newMapForm.baseLevel}
              InputLabelProps={{ sx: { fontSize: 11 } }} inputProps={{ style: { fontSize: 12 }, min: 1 }}
              onChange={e => setNewMapForm(p => ({ ...p, baseLevel: Math.max(1, Number(e.target.value)) }))} />
            <TextField label="Lv幅" type="number" size="small" sx={{ flex: 1 }}
              value={newMapForm.levelVariance}
              InputLabelProps={{ sx: { fontSize: 11 } }} inputProps={{ style: { fontSize: 12 }, min: 0 }}
              onChange={e => setNewMapForm(p => ({ ...p, levelVariance: Math.max(0, Number(e.target.value)) }))} />
          </Box>
          <Typography variant="caption" sx={{ color: "#555" }}>
            IDは自動採番されます。敵IDや町情報はマスタエディタで追加できます。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
          <Button onClick={() => setShowNewMapDialog(false)} sx={{ color: "#888", fontSize: 12 }}>キャンセル</Button>
          <Button variant="contained" color="warning" onClick={createNewMap}
            disabled={!newMapForm.name.trim()} sx={{ fontSize: 12, fontWeight: 700 }}>
            作成して編集開始
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
