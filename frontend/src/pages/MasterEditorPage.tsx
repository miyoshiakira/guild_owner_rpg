import { useState, useMemo } from "react";
import {
  Box, Typography, List, ListItemButton, ListItemText, TextField,
  Button, IconButton, Chip, Select, MenuItem, FormControl, InputLabel,
  Divider, Tooltip, Paper, Autocomplete,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import enemiesJson from "../data/masters/json/enemies.json";
import itemsJson from "../data/masters/json/items.json";
import skillsJson from "../data/masters/json/skills.json";
import materialsJson from "../data/masters/json/materials.json";
import partyMembersJson from "../data/masters/json/partyMembers.json";
import storyNPCsJson from "../data/masters/json/storyNPCs.json";
import racesJson from "../data/masters/json/races.json";
import personalitiesJson from "../data/masters/json/personalities.json";
import typeGrowthJson from "../data/masters/json/typeGrowth.json";
import storyEventsJson from "../data/masters/json/storyEvents.json";
import { MAP_IDS } from "../data/masters/mapMaster";
import { useGame } from "../store/gameStore";

// ─── オプション定数 ─────────────────────────────────────────────────────────
const ELEMENT_OPTS = ["炎", "水", "地", "光", "闇"];
const RACE_OPTS = (racesJson as { name: string }[]).map(r => r.name);
const PERSONALITY_OPTS = (personalitiesJson as { name: string }[]).map(p => p.name);
const SKILL_OPTS = (skillsJson as { name: string }[]).map(s => s.name);
const MAP_ID_OPTS = Object.values(MAP_IDS);
const ITEM_TYPE_OPTS = ["消耗品", "武器", "防具", "特殊"];
const TRIGGER_OPTS = ["step", "interact"];

// ─── フィールド型定義 ────────────────────────────────────────────────────────
type FieldDef =
  | { k: string; label: string; t: "id" }
  | { k: string; label: string; t: "text" | "textarea" }
  | { k: string; label: string; t: "number"; min?: number; max?: number; step?: number }
  | { k: string; label: string; t: "select"; opts: string[] }
  | { k: string; label: string; t: "tags"; opts?: string[] }
  | { k: string; label: string; t: "growth" }
  | { k: string; label: string; t: "vec2"; labelA?: string; labelB?: string }
  | { k: string; label: string; t: "reward" }
  | { k: string; label: string; t: "json" };

interface MasterConfig {
  key: string;
  label: string;
  filename: string;
  idField: string | null;
  nameField: string;
  fields: FieldDef[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial: Record<string, any>[];
}

// ─── マスタ設定 ─────────────────────────────────────────────────────────────
const MASTER_CONFIGS: MasterConfig[] = [
  {
    key: "enemies", label: "敵", filename: "enemies.json",
    idField: "id", nameField: "name",
    initial: enemiesJson as Record<string, unknown>[],
    fields: [
      { k: "id", label: "ID", t: "id" },
      { k: "name", label: "名前", t: "text" },
      { k: "type", label: "属性", t: "select", opts: ELEMENT_OPTS },
      { k: "race", label: "種族", t: "select", opts: RACE_OPTS },
      { k: "level", label: "Lv", t: "number", min: 1 },
      { k: "hp", label: "HP", t: "number", min: 1 },
      { k: "maxHp", label: "MaxHP", t: "number", min: 1 },
      { k: "mp", label: "MP", t: "number", min: 0 },
      { k: "maxMp", label: "MaxMP", t: "number", min: 0 },
      { k: "atk", label: "ATK", t: "number", min: 1 },
      { k: "def", label: "DEF", t: "number", min: 1 },
      { k: "spd", label: "SPD", t: "number", min: 1 },
      { k: "sprite", label: "スプライト", t: "text" },
      { k: "catchRate", label: "捕獲率", t: "number", min: 0, max: 1, step: 0.05 },
      { k: "personality", label: "性格", t: "select", opts: PERSONALITY_OPTS },
      { k: "reward", label: "報酬", t: "reward" },
      { k: "skills", label: "スキル", t: "tags", opts: SKILL_OPTS },
      { k: "drops", label: "ドロップ", t: "json" },
    ],
  },
  {
    key: "items", label: "アイテム", filename: "items.json",
    idField: "id", nameField: "name",
    initial: itemsJson as Record<string, unknown>[],
    fields: [
      { k: "id", label: "ID", t: "id" },
      { k: "name", label: "名前", t: "text" },
      { k: "type", label: "種類", t: "select", opts: ITEM_TYPE_OPTS },
      { k: "effect", label: "効果", t: "text" },
      { k: "sprite", label: "絵文字", t: "text" },
    ],
  },
  {
    key: "skills", label: "スキル", filename: "skills.json",
    idField: "id", nameField: "name",
    initial: skillsJson as Record<string, unknown>[],
    fields: [
      { k: "id", label: "ID", t: "id" },
      { k: "name", label: "名前", t: "text" },
      { k: "power", label: "威力", t: "number", min: 0 },
      { k: "mpCost", label: "MPコスト", t: "number", min: 0 },
      { k: "description", label: "説明", t: "textarea" },
    ],
  },
  {
    key: "materials", label: "素材", filename: "materials.json",
    idField: "id", nameField: "name",
    initial: materialsJson as Record<string, unknown>[],
    fields: [
      { k: "id", label: "ID", t: "id" },
      { k: "name", label: "名前", t: "text" },
      { k: "emoji", label: "絵文字", t: "text" },
      { k: "description", label: "説明", t: "textarea" },
    ],
  },
  {
    key: "partyMembers", label: "パーティメンバー", filename: "partyMembers.json",
    idField: "id", nameField: "name",
    initial: partyMembersJson as Record<string, unknown>[],
    fields: [
      { k: "id", label: "ID", t: "id" },
      { k: "name", label: "名前", t: "text" },
      { k: "type", label: "属性", t: "select", opts: ELEMENT_OPTS },
      { k: "race", label: "種族", t: "select", opts: RACE_OPTS },
      { k: "maxHp", label: "MaxHP", t: "number", min: 1 },
      { k: "maxMp", label: "MaxMP", t: "number", min: 0 },
      { k: "atk", label: "ATK", t: "number", min: 1 },
      { k: "def", label: "DEF", t: "number", min: 1 },
      { k: "spd", label: "SPD", t: "number", min: 1 },
      { k: "personality", label: "性格", t: "select", opts: PERSONALITY_OPTS },
      { k: "sprite", label: "スプライト", t: "text" },
      { k: "skills", label: "スキル", t: "tags", opts: SKILL_OPTS },
    ],
  },
  {
    key: "storyNPCs", label: "ストーリーNPC", filename: "storyNPCs.json",
    idField: "id", nameField: "name",
    initial: storyNPCsJson as Record<string, unknown>[],
    fields: [
      { k: "id", label: "ID", t: "id" },
      { k: "name", label: "名前", t: "text" },
      { k: "description", label: "説明", t: "textarea" },
      { k: "emoji", label: "絵文字", t: "text" },
      { k: "mapId", label: "マップID", t: "select", opts: MAP_ID_OPTS },
      { k: "position", label: "座標", t: "vec2", labelA: "Row", labelB: "Col" },
      { k: "dialogues", label: "セリフ", t: "json" },
    ],
  },
  {
    key: "races", label: "種族", filename: "races.json",
    idField: null, nameField: "name",
    initial: racesJson as Record<string, unknown>[],
    fields: [
      { k: "name", label: "名前", t: "id" },
      { k: "description", label: "説明", t: "textarea" },
      { k: "growth", label: "成長率", t: "growth" },
    ],
  },
  {
    key: "personalities", label: "性格", filename: "personalities.json",
    idField: null, nameField: "name",
    initial: personalitiesJson as Record<string, unknown>[],
    fields: [
      { k: "name", label: "名前", t: "id" },
      { k: "description", label: "説明", t: "textarea" },
      { k: "growth", label: "成長率", t: "growth" },
    ],
  },
  {
    key: "typeGrowth", label: "属性成長", filename: "typeGrowth.json",
    idField: null, nameField: "type",
    initial: typeGrowthJson as Record<string, unknown>[],
    fields: [
      { k: "type", label: "属性", t: "select", opts: ELEMENT_OPTS },
      { k: "description", label: "説明", t: "textarea" },
      { k: "growth", label: "成長率", t: "growth" },
    ],
  },
  {
    key: "storyEvents", label: "ストーリーイベント", filename: "storyEvents.json",
    idField: "id", nameField: "name",
    initial: storyEventsJson as Record<string, unknown>[],
    fields: [
      { k: "id", label: "ID", t: "id" },
      { k: "name", label: "名前", t: "text" },
      { k: "description", label: "説明", t: "textarea" },
      { k: "chapter", label: "章", t: "number", min: 0 },
      { k: "mapId", label: "マップID", t: "select", opts: MAP_ID_OPTS },
      { k: "position", label: "座標", t: "vec2", labelA: "Row", labelB: "Col" },
      { k: "trigger", label: "トリガー", t: "select", opts: TRIGGER_OPTS },
      { k: "conditions", label: "条件", t: "json" },
      { k: "data", label: "データ", t: "json" },
    ],
  },
];

// ─── フィールドコンポーネント ────────────────────────────────────────────────

function GrowthField({
  value, onChange,
}: { value: Record<string, number>; onChange: (v: Record<string, number>) => void }) {
  const stats = ["hp", "mp", "atk", "def", "spd"];
  return (
    <Box>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>成長率</Typography>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        {stats.map(s => (
          <TextField key={s} label={s.toUpperCase()} type="number" value={value?.[s] ?? 1} size="small"
            inputProps={{ step: 0.1, min: 0 }} sx={{ width: 54 }}
            InputLabelProps={{ sx: { fontSize: 10 } }} inputProps={{ style: { fontSize: 11, padding: "4px 6px" } }}
            onChange={e => onChange({ ...value, [s]: parseFloat(e.target.value) })} />
        ))}
      </Box>
    </Box>
  );
}

function Vec2Field({
  label, value, labelA = "X", labelB = "Y", onChange,
}: { label: string; value: Record<string, number>; labelA?: string; labelB?: string; onChange: (v: Record<string, number>) => void }) {
  const keys = Object.keys(value ?? { row: 0, col: 0 });
  const [ka, kb] = keys.length >= 2 ? [keys[0], keys[1]] : ["row", "col"];
  return (
    <Box>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>{label}</Typography>
      <Box sx={{ display: "flex", gap: 0.75 }}>
        <TextField label={labelA} type="number" value={value?.[ka] ?? 0} size="small" sx={{ flex: 1 }}
          InputLabelProps={{ sx: { fontSize: 11 } }} inputProps={{ style: { fontSize: 12 }, min: 0 }}
          onChange={e => onChange({ ...value, [ka]: parseInt(e.target.value) })} />
        <TextField label={labelB} type="number" value={value?.[kb] ?? 0} size="small" sx={{ flex: 1 }}
          InputLabelProps={{ sx: { fontSize: 11 } }} inputProps={{ style: { fontSize: 12 }, min: 0 }}
          onChange={e => onChange({ ...value, [kb]: parseInt(e.target.value) })} />
      </Box>
    </Box>
  );
}

function RewardField({
  value, onChange,
}: { value: Record<string, number>; onChange: (v: Record<string, number>) => void }) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>報酬</Typography>
      <Box sx={{ display: "flex", gap: 0.75 }}>
        <TextField label="EXP" type="number" value={value?.exp ?? 0} size="small" sx={{ flex: 1 }}
          InputLabelProps={{ sx: { fontSize: 11 } }} inputProps={{ style: { fontSize: 12 }, min: 0 }}
          onChange={e => onChange({ ...value, exp: parseInt(e.target.value) })} />
        <TextField label="Gold" type="number" value={value?.gold ?? 0} size="small" sx={{ flex: 1 }}
          InputLabelProps={{ sx: { fontSize: 11 } }} inputProps={{ style: { fontSize: 12 }, min: 0 }}
          onChange={e => onChange({ ...value, gold: parseInt(e.target.value) })} />
      </Box>
    </Box>
  );
}

function TagsField({
  label, value, opts, onChange,
}: { label: string; value: string[]; opts?: string[]; onChange: (v: string[]) => void }) {
  const tags = Array.isArray(value) ? value : [];
  return (
    <Box>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>{label}</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.5, minHeight: 24 }}>
        {tags.map(tag => (
          <Chip key={tag} label={tag} size="small" onDelete={() => onChange(tags.filter(t => t !== tag))}
            sx={{ height: 20, fontSize: 11, "& .MuiChip-deleteIcon": { fontSize: 14 } }} />
        ))}
      </Box>
      <Autocomplete
        options={(opts ?? []).filter(o => !tags.includes(o))}
        freeSolo size="small"
        onChange={(_, v) => { if (v && !tags.includes(v)) onChange([...tags, v]); }}
        renderInput={params => <TextField {...params} label={`${label}を追加`} size="small" InputLabelProps={{ sx: { fontSize: 11 } }} />}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter") {
            const input = (e.target as HTMLInputElement).value;
            if (input && !tags.includes(input)) { onChange([...tags, input]); }
          }
        }}
      />
    </Box>
  );
}

function JsonField({
  label, value, onChange,
}: { label: string; value: unknown; onChange: (v: unknown) => void }) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [hasError, setHasError] = useState(false);
  return (
    <Box>
      <Typography variant="caption" sx={{ color: hasError ? "error.main" : "text.secondary", display: "block", mb: 0.5 }}>
        {label} {hasError && "— JSON構文エラー"}
      </Typography>
      <TextField value={text} size="small" multiline rows={4} fullWidth
        sx={{ "& textarea": { fontFamily: "monospace", fontSize: 11 } }}
        onChange={e => {
          setText(e.target.value);
          try { onChange(JSON.parse(e.target.value)); setHasError(false); }
          catch { setHasError(true); }
        }} />
    </Box>
  );
}

// ─── レコードフォーム ──────────────────────────────────────────────────────
function RecordForm({
  record, fields, onChange,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  record: Record<string, any>;
  fields: FieldDef[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (updated: Record<string, any>) => void;
}) {
  const upd = (k: string, v: unknown) => onChange({ ...record, [k]: v });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {fields.map(f => {
        const val = record[f.k];
        switch (f.t) {
          case "id":
            return (
              <TextField key={f.k} label={f.label} value={String(val ?? "")} size="small" fullWidth
                InputLabelProps={{ sx: { fontSize: 12 } }}
                inputProps={{ style: { fontSize: 12, fontFamily: "monospace", color: "#999" }, readOnly: true }} />
            );
          case "text":
            return (
              <TextField key={f.k} label={f.label} value={String(val ?? "")} size="small" fullWidth
                InputLabelProps={{ sx: { fontSize: 12 } }} inputProps={{ style: { fontSize: 12 } }}
                onChange={e => upd(f.k, e.target.value)} />
            );
          case "textarea":
            return (
              <TextField key={f.k} label={f.label} value={String(val ?? "")} size="small" fullWidth multiline rows={3}
                InputLabelProps={{ sx: { fontSize: 12 } }} inputProps={{ style: { fontSize: 12 } }}
                onChange={e => upd(f.k, e.target.value)} />
            );
          case "number":
            return (
              <TextField key={f.k} label={f.label} type="number" value={val ?? 0} size="small" fullWidth
                InputLabelProps={{ sx: { fontSize: 12 } }} inputProps={{ style: { fontSize: 12 }, min: f.min, max: f.max, step: f.step ?? 1 }}
                onChange={e => upd(f.k, parseFloat(e.target.value))} />
            );
          case "select":
            return (
              <FormControl key={f.k} size="small" fullWidth>
                <InputLabel sx={{ fontSize: 12 }}>{f.label}</InputLabel>
                <Select value={String(val ?? "")} label={f.label} sx={{ fontSize: 12 }}
                  onChange={e => upd(f.k, e.target.value)}>
                  {f.opts.map(o => <MenuItem key={o} value={o} sx={{ fontSize: 12 }}>{o}</MenuItem>)}
                </Select>
              </FormControl>
            );
          case "tags":
            return (
              <TagsField key={f.k} label={f.label} value={Array.isArray(val) ? val : []}
                opts={f.opts} onChange={v => upd(f.k, v)} />
            );
          case "growth":
            return (
              <GrowthField key={f.k} value={val as Record<string, number>}
                onChange={v => upd(f.k, v)} />
            );
          case "vec2":
            return (
              <Vec2Field key={f.k} label={f.label} value={val as Record<string, number>}
                labelA={f.labelA} labelB={f.labelB} onChange={v => upd(f.k, v)} />
            );
          case "reward":
            return (
              <RewardField key={f.k} value={val as Record<string, number>}
                onChange={v => upd(f.k, v)} />
            );
          case "json":
            return (
              <JsonField key={f.k} label={f.label} value={val}
                onChange={v => upd(f.k, v)} />
            );
          default:
            return null;
        }
      })}
    </Box>
  );
}

// ─── メインコンポーネント ─────────────────────────────────────────────────
export default function MasterEditorPage() {
  const { dispatch } = useGame();

  const [activeMasterKey, setActiveMasterKey] = useState("enemies");
  const [allData, setAllData] = useState<Record<string, Record<string, unknown>[]>>(() =>
    Object.fromEntries(MASTER_CONFIGS.map(c => [c.key, JSON.parse(JSON.stringify(c.initial))]))
  );
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "copied">("idle");

  const config = MASTER_CONFIGS.find(c => c.key === activeMasterKey)!;
  const records = allData[activeMasterKey];

  const filtered = useMemo(() => {
    if (!searchQuery) return records.map((r, i) => ({ r, i }));
    const q = searchQuery.toLowerCase();
    return records
      .map((r, i) => ({ r, i }))
      .filter(({ r }) =>
        Object.values(r).some(v => String(v).toLowerCase().includes(q))
      );
  }, [records, searchQuery]);

  const switchMaster = (key: string) => {
    setActiveMasterKey(key);
    setSelectedIdx(null);
    setDraft(null);
    setSearchQuery("");
    setSaveStatus("idle");
  };

  const selectRecord = (idx: number) => {
    setSelectedIdx(idx);
    setDraft(JSON.parse(JSON.stringify(records[idx])));
  };

  const applyDraft = () => {
    if (draft === null || selectedIdx === null) return;
    setAllData(prev => ({
      ...prev,
      [activeMasterKey]: prev[activeMasterKey].map((r, i) => i === selectedIdx ? draft : r),
    }));
  };

  const addRecord = () => {
    const template = records.length > 0 ? JSON.parse(JSON.stringify(records[0])) : {};
    // IDフィールドを新規生成
    if (config.idField && template[config.idField]) {
      template[config.idField] = `${config.idField.replace("id", "")}-new-${Date.now()}`;
    }
    if (config.nameField) template[config.nameField] = "（新規）";
    const newRecords = [...records, template];
    setAllData(prev => ({ ...prev, [activeMasterKey]: newRecords }));
    selectRecord(newRecords.length - 1);
  };

  const deleteRecord = () => {
    if (selectedIdx === null) return;
    const newRecords = records.filter((_, i) => i !== selectedIdx);
    setAllData(prev => ({ ...prev, [activeMasterKey]: newRecords }));
    setSelectedIdx(null); setDraft(null);
  };

  const saveToFile = async () => {
    const json = JSON.stringify(records, null, 2);
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as unknown as { showSaveFilePicker: (o: object) => Promise<FileSystemFileHandle> })
          .showSaveFilePicker({
            suggestedName: config.filename,
            types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
          });
        const w = await handle.createWritable();
        await w.write(json); await w.close();
        setSaveStatus("saved"); setTimeout(() => setSaveStatus("idle"), 2500);
      } catch { /* cancel */ }
    } else {
      await navigator.clipboard.writeText(json);
      setSaveStatus("copied"); setTimeout(() => setSaveStatus("idle"), 2500);
    }
  };

  const getLabel = (r: Record<string, unknown>) =>
    String(r[config.nameField] ?? r[config.idField ?? ""] ?? "?");
  const getSubLabel = (r: Record<string, unknown>) =>
    config.idField ? String(r[config.idField] ?? "") : "";

  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#0e0e1c", color: "#eee", overflow: "hidden" }}>
      {/* ── 左サイドバー: マスタ選択 ── */}
      <Box sx={{ width: 170, flexShrink: 0, borderRight: "1px solid #2a2a3e", bgcolor: "#13132a", display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 1.5, borderBottom: "1px solid #2a2a3e" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
            <IconButton size="small" onClick={() => dispatch({ type: "SET_SCENE", payload: "debug" })} sx={{ color: "#888" }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 13 }}>マスタ編集</Typography>
          </Box>
        </Box>
        <List dense sx={{ flex: 1, overflowY: "auto", py: 0 }}>
          {MASTER_CONFIGS.map(c => (
            <ListItemButton key={c.key} selected={activeMasterKey === c.key}
              onClick={() => switchMaster(c.key)} sx={{ py: 0.75 }}>
              <ListItemText primary={c.label}
                primaryTypographyProps={{ fontSize: 12, fontWeight: activeMasterKey === c.key ? 700 : 400 }} />
              <Typography variant="caption" sx={{ color: "#555", fontSize: 10 }}>
                {allData[c.key].length}
              </Typography>
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* ── 中央: レコードリスト ── */}
      <Box sx={{ width: 240, flexShrink: 0, borderRight: "1px solid #2a2a3e", display: "flex", flexDirection: "column", bgcolor: "#0e0e1c" }}>
        {/* ヘッダー */}
        <Box sx={{ p: 1.5, borderBottom: "1px solid #2a2a3e" }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>{config.label}</Typography>
          <TextField
            placeholder="検索..."
            value={searchQuery}
            size="small"
            fullWidth
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{ sx: { fontSize: 12 } }}
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addRecord} sx={{ flex: 1, fontSize: 11 }}>追加</Button>
            <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />}
              onClick={deleteRecord} disabled={selectedIdx === null} sx={{ flex: 1, fontSize: 11 }}>削除</Button>
          </Box>
        </Box>

        {/* リスト */}
        <List dense sx={{ flex: 1, overflowY: "auto", py: 0 }}>
          {filtered.map(({ r, i }) => (
            <ListItemButton key={i} selected={selectedIdx === i} onClick={() => selectRecord(i)} sx={{ py: 0.5 }}>
              <ListItemText
                primary={getLabel(r)}
                secondary={getSubLabel(r)}
                primaryTypographyProps={{ fontSize: 12, noWrap: true }}
                secondaryTypographyProps={{ fontSize: 10, noWrap: true, color: "#555" }}
              />
            </ListItemButton>
          ))}
          {filtered.length === 0 && (
            <Box sx={{ p: 2, color: "#555", textAlign: "center" }}>
              <Typography variant="caption">一致なし</Typography>
            </Box>
          )}
        </List>

        {/* 保存ボタン */}
        <Box sx={{ p: 1.5, borderTop: "1px solid #2a2a3e", display: "flex", gap: 0.5 }}>
          <Tooltip title={saveStatus === "copied" ? "クリップボードにコピー済み" : "ファイルに保存"}>
            <Button fullWidth size="small" variant="contained"
              color={saveStatus === "idle" ? "primary" : "success"}
              startIcon={saveStatus === "copied" ? <ContentCopyIcon /> : <SaveIcon />}
              onClick={saveToFile} sx={{ fontSize: 11 }}>
              {saveStatus === "idle" ? "JSONを保存" : saveStatus === "saved" ? "保存完了" : "コピー済み"}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* ── 右パネル: 編集フォーム ── */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {draft !== null && selectedIdx !== null ? (
          <>
            {/* フォームヘッダー */}
            <Box sx={{ p: 1.5, borderBottom: "1px solid #2a2a3e", display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>
                {getLabel(records[selectedIdx])}
              </Typography>
              <Button size="small" variant="outlined" onClick={() => setDraft(JSON.parse(JSON.stringify(records[selectedIdx])))} sx={{ fontSize: 11 }}>
                リセット
              </Button>
              <Button size="small" variant="contained" onClick={applyDraft} sx={{ fontSize: 11 }}>
                反映
              </Button>
            </Box>

            {/* フォーム本体 */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
              <RecordForm record={draft} fields={config.fields} onChange={setDraft} />

              <Divider sx={{ my: 2 }} />

              {/* 生JSON表示 */}
              <Typography variant="caption" sx={{ color: "#555", display: "block", mb: 0.5 }}>
                生JSON（参照用）
              </Typography>
              <Paper variant="outlined" sx={{ p: 1, bgcolor: "#080810", borderColor: "#2a2a3e", maxHeight: 200, overflow: "auto" }}>
                <Typography variant="caption" component="pre" sx={{ fontFamily: "monospace", fontSize: 10, color: "#666", m: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {JSON.stringify(draft, null, 2)}
                </Typography>
              </Paper>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#444" }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" sx={{ mb: 1, color: "#333" }}>レコードを選択</Typography>
              <Typography variant="caption" sx={{ color: "#444" }}>
                左のリストからレコードを選択して編集
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
