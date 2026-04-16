import { useState, useCallback, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import SaveIcon from "@mui/icons-material/Save";
import { MAP_TILE_MASTER } from "../data/map/mapChipConfig";
import { MAP_IDS, MAP_MASTER_MAP } from "../data/masters/mapMaster";
import { STORY_EVENT_MASTER } from "../data/masters/storyEventMaster";
import { useGame } from "../store/gameStore";
import type { StoryEvent } from "../types/masters";

const MAP_LIST = Object.entries(MAP_IDS).map(([, id]) => ({
  id,
  name: MAP_MASTER_MAP[id]?.name ?? id,
}));

const TILE_IDS = Object.keys(MAP_TILE_MASTER).map(Number).sort((a, b) => a - b);

// trigger種別ごとのマーカー色
const TRIGGER_COLOR: Record<StoryEvent["trigger"], string> = {
  step: "#ffd740",
  interact: "#40c4ff",
};

function cloneGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

function toCsv(grid: number[][]): string {
  return grid.map((row) => row.join(",")).join("\n");
}

// mapId の正規化: "map-1" / "map-001" どちらでもマッチさせる
function normalizeMapId(id: string): string {
  return id.replace(/^map-0*/, "map-");
}

export default function MapEditorPage() {
  const { dispatch } = useGame();
  const [selectedMapId, setSelectedMapId] = useState<string>(MAP_LIST[0].id);
  const [selectedTile, setSelectedTile] = useState<number>(0);
  const [grid, setGrid] = useState<number[][]>(() =>
    cloneGrid(MAP_MASTER_MAP[MAP_LIST[0].id]!.tileMap)
  );
  const [showEvents, setShowEvents] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const isPainting = useRef(false);

  const loadMap = useCallback((mapId: string) => {
    setSelectedMapId(mapId);
    setGrid(cloneGrid(MAP_MASTER_MAP[mapId]!.tileMap));
    setSaveStatus("idle");
  }, []);

  const paintCell = useCallback((row: number, col: number) => {
    setGrid((prev) => {
      const next = cloneGrid(prev);
      next[row][col] = selectedTile;
      return next;
    });
    setSaveStatus("idle");
  }, [selectedTile]);

  const handleMouseDown = (row: number, col: number) => {
    isPainting.current = true;
    paintCell(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isPainting.current) paintCell(row, col);
  };

  const handleMouseUp = () => {
    isPainting.current = false;
  };

  // CSVダウンロード
  const downloadCsv = () => {
    const csv = toCsv(grid);
    const mapNum = selectedMapId.replace("map-", "").replace(/^0+/, "").padStart(3, "0");
    const filename = `map-${mapNum}.csv`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // CSV上書き保存 (File System Access API)
  const overwriteCsv = async () => {
    const csv = toCsv(grid);
    const rawNum = selectedMapId.replace(/^map-0*/, "");
    const paddedNum = rawNum.padStart(3, "0");
    const filename = `map-${paddedNum}.csv`;

    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as unknown as {
          showSaveFilePicker: (opts: object) => Promise<FileSystemFileHandle>;
        }).showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: "CSV", accept: { "text/csv": [".csv"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(csv);
        await writable.close();
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch {
        // ユーザーキャンセル時は何もしない
      }
    } else {
      // フォールバック: ダウンロード
      downloadCsv();
    }
  };

  // 現在のマップのイベントを行列キー "row-col" → StoryEvent[] に変換
  const eventMap = useMemo(() => {
    const map = new Map<string, StoryEvent[]>();
    const normSelected = normalizeMapId(selectedMapId);
    STORY_EVENT_MASTER.forEach((evt) => {
      if (normalizeMapId(evt.mapId) !== normSelected) return;
      const key = `${evt.position.row}-${evt.position.col}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(evt);
    });
    return map;
  }, [selectedMapId]);

  const eventsOnCurrentMap = useMemo(() => {
    const normSelected = normalizeMapId(selectedMapId);
    return STORY_EVENT_MASTER.filter(
      (e) => normalizeMapId(e.mapId) === normSelected
    );
  }, [selectedMapId]);

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const cellSize = Math.min(28, Math.floor((window.innerWidth - 320) / cols));

  return (
    <Box
      sx={{ display: "flex", height: "100vh", bgcolor: "#1a1a2e", color: "#fff", userSelect: "none" }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ── サイドパネル ── */}
      <Box sx={{ width: 280, flexShrink: 0, p: 2, borderRight: "1px solid #333", overflowY: "auto" }}>

        {/* ヘッダー */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Button
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={() => dispatch({ type: "SET_SCENE", payload: "debug" })}
            sx={{ color: "#aaa", minWidth: 0, px: 1 }}
          >
            戻る
          </Button>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            マップエディタ
          </Typography>
        </Box>

        {/* マップ選択 */}
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>マップ</InputLabel>
          <Select
            value={selectedMapId}
            label="マップ"
            onChange={(e) => loadMap(e.target.value)}
          >
            {MAP_LIST.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.id} {m.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* 保存ボタン群 */}
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<SaveIcon />}
            onClick={overwriteCsv}
            color={saveStatus === "saved" ? "success" : "warning"}
            sx={{ fontWeight: "bold" }}
          >
            {saveStatus === "saved" ? "保存済み" : "上書き保存"}
          </Button>
          <Tooltip title="CSVダウンロード">
            <Button
              variant="outlined"
              onClick={downloadCsv}
              sx={{ minWidth: 0, px: 1, color: "#aaa", borderColor: "#555" }}
            >
              <DownloadIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Box>

        <Typography variant="caption" sx={{ mb: 2, display: "block", color: "#555" }}>
          {rows} × {cols} タイル
        </Typography>

        <Divider sx={{ borderColor: "#333", mb: 2 }} />

        {/* タイルパレット */}
        <Typography variant="subtitle2" sx={{ mb: 1, color: "#aaa" }}>
          タイルパレット
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
          {TILE_IDS.map((id) => {
            const tile = MAP_TILE_MASTER[id];
            return (
              <Box
                key={id}
                onClick={() => setSelectedTile(id)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: "4px 8px",
                  borderRadius: 1,
                  cursor: "pointer",
                  border: selectedTile === id ? "2px solid #fff" : "2px solid transparent",
                  bgcolor: selectedTile === id ? "#333" : "transparent",
                  "&:hover": { bgcolor: "#2a2a3e" },
                }}
              >
                <Box sx={{ width: 20, height: 20, borderRadius: "2px", bgcolor: tile.color, flexShrink: 0 }} />
                <Typography variant="body2">{id}: {tile.name}</Typography>
              </Box>
            );
          })}
        </Box>

        <Divider sx={{ borderColor: "#333", mb: 2 }} />

        {/* イベントオーバーレイ */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "#aaa" }}>
            イベント表示
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showEvents}
                onChange={(e) => setShowEvents(e.target.checked)}
                size="small"
                color="warning"
              />
            }
            label=""
            sx={{ m: 0 }}
          />
        </Box>

        {/* 凡例 */}
        <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: TRIGGER_COLOR.step }} />
            <Typography variant="caption" sx={{ color: "#888" }}>step</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: TRIGGER_COLOR.interact }} />
            <Typography variant="caption" sx={{ color: "#888" }}>interact</Typography>
          </Box>
        </Box>

        {/* このマップのイベント一覧 */}
        {eventsOnCurrentMap.length === 0 ? (
          <Typography variant="caption" sx={{ color: "#555" }}>
            イベントなし
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {eventsOnCurrentMap.map((evt) => (
              <Box
                key={evt.id}
                sx={{ display: "flex", alignItems: "center", gap: 0.75, opacity: showEvents ? 1 : 0.35 }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: TRIGGER_COLOR[evt.trigger],
                    flexShrink: 0,
                  }}
                />
                <Typography variant="caption" sx={{ color: "#ccc", lineHeight: 1.3 }}>
                  ({evt.position.row},{evt.position.col}) {evt.name}
                </Typography>
                <Chip
                  label={evt.trigger}
                  size="small"
                  sx={{
                    height: 14,
                    fontSize: 9,
                    bgcolor: "transparent",
                    border: `1px solid ${TRIGGER_COLOR[evt.trigger]}`,
                    color: TRIGGER_COLOR[evt.trigger],
                    ml: "auto",
                    "& .MuiChip-label": { px: 0.5 },
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* ── グリッドエリア ── */}
      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: "#aaa" }}>
          {selectedMapId} — {MAP_MASTER_MAP[selectedMapId]?.name}
          {eventsOnCurrentMap.length > 0 && showEvents && (
            <Typography component="span" variant="caption" sx={{ ml: 1.5, color: "#ffd740" }}>
              イベント {eventsOnCurrentMap.length}件
            </Typography>
          )}
        </Typography>

        <Box sx={{ display: "inline-block", border: "1px solid #444", lineHeight: 0 }}>
          {grid.map((row, r) => (
            <Box key={r} sx={{ display: "flex" }}>
              {row.map((tileId, c) => {
                const tile = MAP_TILE_MASTER[tileId];
                const cellKey = `${r}-${c}`;
                const eventsHere = showEvents ? (eventMap.get(cellKey) ?? []) : [];
                const hasEvents = eventsHere.length > 0;

                const tooltipTitle = [
                  `(${r},${c}) ${tile?.name ?? tileId}`,
                  ...eventsHere.map((e) => `▶ ${e.name} [${e.trigger}]`),
                ].join("\n");

                return (
                  <Tooltip
                    key={c}
                    title={<span style={{ whiteSpace: "pre-line" }}>{tooltipTitle}</span>}
                    placement="top"
                    disableInteractive
                    arrow={false}
                  >
                    <Box
                      onMouseDown={() => handleMouseDown(r, c)}
                      onMouseEnter={() => handleMouseEnter(r, c)}
                      sx={{
                        position: "relative",
                        width: cellSize,
                        height: cellSize,
                        bgcolor: tile?.color ?? "#333",
                        boxSizing: "border-box",
                        border: "0.5px solid rgba(0,0,0,0.3)",
                        cursor: "crosshair",
                        "&:hover": {
                          outline: "1.5px solid rgba(255,255,255,0.6)",
                          zIndex: 1,
                        },
                      }}
                    >
                      {/* イベントマーカー */}
                      {hasEvents && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 1,
                            right: 1,
                            width: Math.max(6, cellSize * 0.35),
                            height: Math.max(6, cellSize * 0.35),
                            borderRadius: "50%",
                            bgcolor: eventsHere.length > 1
                              ? "#ff6b6b"
                              : TRIGGER_COLOR[eventsHere[0].trigger],
                            border: "1px solid rgba(0,0,0,0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: cellSize >= 20 ? 8 : 6,
                            fontWeight: "bold",
                            color: "#000",
                            lineHeight: 1,
                            pointerEvents: "none",
                            zIndex: 2,
                          }}
                        >
                          {eventsHere.length > 1 ? eventsHere.length : ""}
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
