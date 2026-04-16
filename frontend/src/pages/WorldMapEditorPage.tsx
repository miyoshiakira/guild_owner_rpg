import { useState, useRef, useCallback, useMemo } from "react";
import {
  Box, Typography, Button, IconButton, ToggleButton, ToggleButtonGroup,
  Select, MenuItem, FormControl, InputLabel, Tooltip, Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import {
  REGION_MASTER, WORLD_LAYOUT, REGION_LAYOUTS,
  deriveEdgesFromTransitions, deriveWorldEdges,
  type NodePos, type GraphLayout,
} from "../data/worldMap/worldMapData";
import { MAP_MASTER } from "../data/masters/mapMaster";
import { useGame } from "../store/gameStore";

// ── 定数 ─────────────────────────────────────────────────────────────────
const CANVAS_W = 560;
const CANVAS_H = 540;
const WORLD_NODE_W = 110;
const WORLD_NODE_H = 58;
const MAP_NODE_W = 92;
const MAP_NODE_H = 50;

type EditorMode = "world" | "region";

// ── ユーティリティ ────────────────────────────────────────────────────────
async function saveJson(filename: string, data: unknown) {
  const json = JSON.stringify(data, null, 2);
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (window as unknown as {
        showSaveFilePicker: (o: object) => Promise<FileSystemFileHandle>;
      }).showSaveFilePicker({
        suggestedName: filename,
        types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
      });
      const w = await handle.createWritable();
      await w.write(json); await w.close();
      return true;
    } catch { return false; }
  } else {
    await navigator.clipboard.writeText(json);
    return true;
  }
}

// ── メインコンポーネント ──────────────────────────────────────────────────
export default function WorldMapEditorPage() {
  const { dispatch } = useGame();
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ id: string; mouseX: number; mouseY: number; nodeX: number; nodeY: number } | null>(null);

  // エディタ状態
  const [mode, setMode] = useState<EditorMode>("world");
  const [selectedRegion, setSelectedRegion] = useState<string>(REGION_MASTER[0].id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState("");

  // レイアウトデータ（ミュータブルコピー）
  const [worldNodes, setWorldNodes] = useState<NodePos[]>(
    () => JSON.parse(JSON.stringify(WORLD_LAYOUT.nodes))
  );
  const [regionLayouts, setRegionLayouts] = useState<Record<string, GraphLayout>>(
    () => JSON.parse(JSON.stringify(REGION_LAYOUTS))
  );

  // 現在表示中のノード（エッジはトランジションから導出）
  const currentNodes = mode === "world" ? worldNodes : (regionLayouts[selectedRegion]?.nodes ?? []);
  const currentEdges = useMemo(
    () => mode === "world"
      ? deriveWorldEdges()
      : deriveEdgesFromTransitions(
          REGION_MASTER.find(r => r.id === selectedRegion)?.mapIds ?? []
        ),
    [mode, selectedRegion]
  );
  const nodeW = mode === "world" ? WORLD_NODE_W : MAP_NODE_W;
  const nodeH = mode === "world" ? WORLD_NODE_H : MAP_NODE_H;

  const setCurrentNodes = useCallback((updater: (prev: NodePos[]) => NodePos[]) => {
    if (mode === "world") {
      setWorldNodes(updater);
    } else {
      setRegionLayouts(prev => {
        const layout = prev[selectedRegion] ?? { nodes: [] };
        return { ...prev, [selectedRegion]: { ...layout, nodes: updater(layout.nodes) } };
      });
    }
  }, [mode, selectedRegion]);

  // ノード情報（ラベル等）
  const mapDataMap = useMemo(
    () => Object.fromEntries(MAP_MASTER.map(m => [m.id, m])),
    []
  );
  const getNodeLabel = (id: string) => {
    if (mode === "world") {
      const r = REGION_MASTER.find(r => r.id === id);
      return r ? `${r.emoji} ${r.name}` : id;
    }
    const m = mapDataMap[id];
    return m ? `${m.emoji} ${m.name}` : id;
  };
  const getNodeColor = (id: string) => {
    if (mode === "world") return REGION_MASTER.find(r => r.id === id)?.color ?? "#2a2a4a";
    return "#2a3a6a";
  };
  const getNodeSub = (id: string) => {
    if (mode === "world") {
      const r = REGION_MASTER.find(r => r.id === id);
      return r ? `${r.mapIds.length}マップ` : "";
    }
    const m = mapDataMap[id];
    return m ? `Lv${m.baseLevel}〜${m.baseLevel + m.levelVariance}` : "";
  };

  // ── ドラッグ ─────────────────────────────────────────────────────────
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, id: string, nodeX: number, nodeY: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    dragStartRef.current = {
      id,
      mouseX: e.clientX - rect.left,
      mouseY: e.clientY - rect.top,
      nodeX, nodeY,
    };
    setSelectedNodeId(id);
  }, []);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    const ds = dragStartRef.current;
    if (!ds || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const dx = mouseX - ds.mouseX;
    const dy = mouseY - ds.mouseY;
    const newX = Math.round(Math.max(nodeW / 2, Math.min(CANVAS_W - nodeW / 2, ds.nodeX + dx)));
    const newY = Math.round(Math.max(nodeH / 2, Math.min(CANVAS_H - nodeH / 2, ds.nodeY + dy)));
    setCurrentNodes(prev => prev.map(n => n.id === ds.id ? { ...n, x: newX, y: newY } : n));
  }, [nodeW, nodeH, setCurrentNodes]);

  const handleCanvasMouseUp = useCallback(() => {
    dragStartRef.current = null;
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // ── 保存 ─────────────────────────────────────────────────────────────
  const showSaveMsg = (msg: string) => {
    setSaveMsg(msg); setTimeout(() => setSaveMsg(""), 3000);
  };

  const saveWorldLayout = async () => {
    const ok = await saveJson("worldLayout.json", { nodes: worldNodes });
    showSaveMsg(ok ? "worldLayout.json 保存完了" : "保存に失敗しました");
  };

  const saveRegionLayouts = async () => {
    const ok = await saveJson("regionLayouts.json", regionLayouts);
    showSaveMsg(ok ? "regionLayouts.json 保存完了" : "保存に失敗しました");
  };

  // ── 選択ノード情報 ────────────────────────────────────────────────────
  const selectedNode = selectedNodeId ? currentNodes.find(n => n.id === selectedNodeId) : null;
  const selectedEdges = selectedNodeId
    ? currentEdges.filter(([a, b]) => a === selectedNodeId || b === selectedNodeId)
    : [];

  // ── レンダリング ─────────────────────────────────────────────────────
  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#0e0e1c", color: "#eee", overflow: "hidden" }}>

      {/* ── 左サイドバー ── */}
      <Box sx={{ width: 220, flexShrink: 0, borderRight: "1px solid #2a2a3e", bgcolor: "#13132a", display: "flex", flexDirection: "column" }}>
        {/* ヘッダー */}
        <Box sx={{ p: 1.5, borderBottom: "1px solid #2a2a3e" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
            <IconButton size="small" onClick={() => dispatch({ type: "SET_SCENE", payload: "debug" })} sx={{ color: "#888" }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13 }}>地図エディタ</Typography>
          </Box>

          {/* モード切替 */}
          <ToggleButtonGroup value={mode} exclusive size="small" fullWidth
            onChange={(_, v) => { if (v) { setMode(v); setSelectedNodeId(null); setPendingConnect(null); } }}>
            <ToggleButton value="world" sx={{ fontSize: 11 }}>🌍 世界</ToggleButton>
            <ToggleButton value="region" sx={{ fontSize: 11 }}>🗺️ 地域</ToggleButton>
          </ToggleButtonGroup>

          {/* 地域選択（地域モード時） */}
          {mode === "region" && (
            <FormControl fullWidth size="small" sx={{ mt: 1 }}>
              <InputLabel sx={{ fontSize: 11 }}>地域</InputLabel>
              <Select value={selectedRegion} label="地域" sx={{ fontSize: 11 }}
                onChange={e => { setSelectedRegion(e.target.value); setSelectedNodeId(null); }}>
                {REGION_MASTER.map(r => (
                  <MenuItem key={r.id} value={r.id} sx={{ fontSize: 11 }}>
                    {r.emoji} {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>

        {/* ツール */}
        <Box sx={{ p: 1.5, borderBottom: "1px solid #2a2a3e" }}>
          <Typography variant="caption" sx={{ color: "#666", display: "block", mb: 0.5 }}>ツール</Typography>
          <Tooltip title="ノードをドラッグして移動">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, p: 0.5, bgcolor: "rgba(124,77,255,0.1)", borderRadius: 1, border: "1px solid rgba(124,77,255,0.3)" }}>
              <OpenWithIcon fontSize="small" sx={{ color: "#aaa" }} />
              <Typography variant="caption" sx={{ fontSize: 11, color: "#ccc" }}>移動（ドラッグ）</Typography>
            </Box>
          </Tooltip>
          <Typography variant="caption" sx={{ color: "#555", display: "block", mt: 0.75, fontSize: 10 }}>
            ※ 接続はマップトランジション設定から自動生成
          </Typography>
        </Box>

        {/* 選択ノード情報 */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
          {selectedNode ? (
            <>
              <Typography variant="caption" sx={{ color: "#888", display: "block", mb: 0.5 }}>選択ノード</Typography>
              <Paper variant="outlined" sx={{ p: 1, bgcolor: "rgba(124,77,255,0.05)", borderColor: "rgba(124,77,255,0.3)", mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 12 }}>
                  {getNodeLabel(selectedNode.id)}
                </Typography>
                <Typography variant="caption" sx={{ color: "#888" }}>
                  {selectedNode.id}
                </Typography>
                <Typography variant="caption" sx={{ color: "#666", display: "block" }}>
                  pos: ({selectedNode.x}, {selectedNode.y})
                </Typography>
              </Paper>

              <Typography variant="caption" sx={{ color: "#666", display: "block", mb: 0.5 }}>
                接続（自動導出） ({selectedEdges.length})
              </Typography>
              {selectedEdges.map(([a, b]) => {
                const otherId = a === selectedNodeId ? b : a;
                return (
                  <Box key={`${a}-${b}`} sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <Typography variant="caption" sx={{ flex: 1, fontSize: 10, color: "#ccc" }}>
                      {getNodeLabel(otherId)}
                    </Typography>
                  </Box>
                );
              })}
            </>
          ) : (
            <Typography variant="caption" sx={{ color: "#444" }}>
              ノードをクリックして選択
            </Typography>
          )}
        </Box>

        {/* 保存ボタン */}
        <Box sx={{ p: 1.5, borderTop: "1px solid #2a2a3e", display: "flex", flexDirection: "column", gap: 0.75 }}>
          {saveMsg && (
            <Typography variant="caption" sx={{ color: "#4caf50", fontSize: 10, textAlign: "center" }}>
              ✓ {saveMsg}
            </Typography>
          )}
          <Button size="small" variant="contained" color="primary" startIcon={<SaveIcon />}
            onClick={saveWorldLayout} sx={{ fontSize: 11 }}>
            worldLayout.json 保存
          </Button>
          <Button size="small" variant="outlined" startIcon={<SaveIcon />}
            onClick={saveRegionLayouts} sx={{ fontSize: 11 }}>
            regionLayouts.json 保存
          </Button>
          <Typography variant="caption" sx={{ color: "#444", fontSize: 9, textAlign: "center" }}>
            保存後はページをリロードして反映
          </Typography>
        </Box>
      </Box>

      {/* ── キャンバスエリア ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* キャンバスヘッダー */}
        <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontSize: 13, color: "#aaa" }}>
            {mode === "world"
              ? "🌍 ワールドマップ — 地域を配置"
              : `🗺️ ${REGION_MASTER.find(r => r.id === selectedRegion)?.emoji} ${REGION_MASTER.find(r => r.id === selectedRegion)?.name} — マップを配置`
            }
          </Typography>
          <Typography variant="caption" sx={{ color: "#555", ml: "auto" }}>
            ノード: {currentNodes.length} / エッジ（自動）: {currentEdges.length}
          </Typography>
        </Box>

        {/* キャンバス本体 */}
        <Box sx={{ flex: 1, overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "flex-start", p: 2 }}>
          <Box
            ref={canvasRef}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onClick={handleCanvasClick}
            sx={{
              position: "relative",
              width: CANVAS_W, height: CANVAS_H,
              bgcolor: "#080812",
              border: "1px solid #2a2a3e",
              borderRadius: 1,
              cursor: "default",
              flexShrink: 0,
              // グリッドガイド
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            {/* SVGエッジ */}
            <svg width={CANVAS_W} height={CANVAS_H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              {currentEdges.map(([a, b]) => {
                const na = currentNodes.find(n => n.id === a);
                const nb = currentNodes.find(n => n.id === b);
                if (!na || !nb) return null;
                const isSelected = a === selectedNodeId || b === selectedNodeId;
                const key = [a, b].sort().join("||");
                return (
                  <line key={key}
                    x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                    stroke={isSelected ? "rgba(100,200,255,0.9)" : "rgba(124,77,255,0.5)"}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    strokeDasharray={isSelected ? undefined : "5,3"}
                  />
                );
              })}
              {/* 接続中のラバーバンド */}
              {/* (シンプルにするためラバーバンドは省略) */}
            </svg>

            {/* ノード */}
            {currentNodes.map(({ id, x, y }) => {
              const isSelected = id === selectedNodeId;
              const color = getNodeColor(id);
              const label = getNodeLabel(id);
              const sub = getNodeSub(id);
              return (
                <Box key={id}
                  onMouseDown={e => handleNodeMouseDown(e, id, x, y)}
                  sx={{
                    position: "absolute",
                    left: x - nodeW / 2, top: y - nodeH / 2,
                    width: nodeW, height: nodeH,
                    bgcolor: `${color}dd`,
                    border: isSelected
                      ? "2px solid rgba(100,200,255,0.9)"
                      : "1.5px solid rgba(124,77,255,0.5)",
                    borderRadius: 1.5,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    cursor: "grab",
                    userSelect: "none",
                    boxShadow: isSelected
                      ? "0 0 12px rgba(100,200,255,0.4)"
                      : "0 2px 8px rgba(0,0,0,0.5)",
                    transition: "box-shadow 0.1s",
                    px: 0.5,
                    "&:active": { cursor: "grabbing" },
                  }}
                >
                  <Typography sx={{
                    fontSize: 10, fontWeight: 700, color: "#fff",
                    textAlign: "center", lineHeight: 1.3,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%",
                  }}>
                    {label}
                  </Typography>
                  {sub && (
                    <Typography sx={{ fontSize: 9, color: "rgba(180,180,255,0.7)", lineHeight: 1.2 }}>
                      {sub}
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: 8, color: "rgba(120,120,180,0.6)", lineHeight: 1 }}>
                    ({x},{y})
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* ヒント */}
        <Box sx={{ px: 2, py: 1, borderTop: "1px solid #2a2a3e", display: "flex", gap: 2, flexWrap: "wrap" }}>
          <HintChip icon="🖱️" text="ノードをドラッグして位置を変更" />
          <HintChip icon="🔗" text="接続線はマップトランジションから自動生成" />
          <HintChip icon="💾" text="保存後ページリロードで反映" />
        </Box>
      </Box>
    </Box>
  );
}

function HintChip({ icon, text }: { icon: string; text: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Typography sx={{ fontSize: 12 }}>{icon}</Typography>
      <Typography variant="caption" sx={{ color: "#555", fontSize: 10 }}>{text}</Typography>
    </Box>
  );
}
