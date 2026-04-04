import React, { useState, useCallback, memo, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  useDndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  Box, Grid, Card, CardContent, Typography, Chip,
  IconButton, Tooltip, Checkbox, LinearProgress,
  Modal, Backdrop, Fade,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import { useGame } from "../store/gameStore";
import type { Equipment, EquipSlot, Monster } from "../types/game";
import { SpriteImage } from "../components/SpriteImage";

// ===== 定数 =====
const SLOT_META: Record<EquipSlot, { label: string; icon: string }> = {
  weapon:    { label: "武器",       icon: "⚔️" },
  armor:     { label: "防具",       icon: "🛡️" },
  accessory: { label: "アクセサリ", icon: "💍" },
};
const SLOT_ORDER: EquipSlot[] = ["weapon", "armor", "accessory"];

const TYPE_COLORS: Record<string, string> = {
  水: "#3a7bd5", 地: "#c8a96a", 光: "#ffd740", 炎: "#f44336", 闇: "#7c4dff",
};

// ===== ドラッグ中フローティングプレビュー =====
// useDndContext で直接取得することで、親の state 変更なしに表示できる
// → ドラッグ開始時の GuildPage 再レンダリングを完全に排除
const DragPreview = memo(function DragPreview() {
  const { active } = useDndContext();
  const eq = (active?.data.current as { eq?: Equipment } | null)?.eq;
  if (!eq) return null;
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.75,
      px: 1.5, py: 0.75,
      bgcolor: "background.paper",
      border: "1.5px solid", borderColor: "primary.main",
      borderRadius: 2,
      boxShadow: "0 4px 20px rgba(124,77,255,0.5)",
      fontSize: 13, fontWeight: 600,
      pointerEvents: "none", whiteSpace: "nowrap",
      // GPU合成レイヤーを事前確保してフレームドロップを抑制
      willChange: "transform",
    }}>
      <span style={{ fontSize: 18 }}>{eq.sprite}</span>
      {eq.name}
    </Box>
  );
});

// ===== 装備チップ（ドラッグ元） =====
const EquipChip = memo(function EquipChip({ eq, compact = false }: { eq: Equipment; compact?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: eq.id,
    data: { eq },
  });
  return (
    <Tooltip title={eq.effect} placement="top" arrow disableInteractive>
      <Box
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: compact ? 0.75 : 1,
          py: compact ? 0.4 : 0.6,
          bgcolor: "rgba(124,77,255,0.15)",
          border: "1px solid rgba(124,77,255,0.4)",
          borderRadius: 1.5,
          cursor: isDragging ? "grabbing" : "grab",
          opacity: isDragging ? 0.25 : 1,
          fontSize: compact ? 12 : 13,
          fontWeight: 600,
          whiteSpace: "nowrap",
          userSelect: "none",
          touchAction: "none",
          "&:hover": { bgcolor: "rgba(124,77,255,0.28)" },
        }}
      >
        <span style={{ fontSize: compact ? 14 : 16 }}>{eq.sprite}</span>
        {eq.name}
      </Box>
    </Tooltip>
  );
});

// ===== 装備スロット（ドロップ先） =====
// useDndContext は active/over が変わったときのみ再レンダリング（マウス移動では発火しない）
const DroppableSlot = memo(function DroppableSlot({ id, slot, equippedItem }: {
  id: string; slot: EquipSlot; equippedItem: Equipment | undefined;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const { active } = useDndContext();
  const activeEq = (active?.data.current as { eq?: Equipment } | null)?.eq;
  const compatible = activeEq ? activeEq.slot === slot : true;
  const meta = SLOT_META[slot];

  const borderColor = isOver
    ? compatible ? "#ffd740" : "rgba(244,67,54,0.8)"
    : "rgba(255,255,255,0.15)";
  const bg = isOver
    ? compatible ? "rgba(255,215,64,0.07)" : "rgba(244,67,54,0.07)"
    : "transparent";

  return (
    <Box
      ref={setNodeRef}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.25,
        py: 0.85,
        borderRadius: 1.5,
        // transition はホバー時の色変化のみ。transform は使わないので paint に閉じる
        border: `1.5px dashed ${borderColor}`,
        bgcolor: bg,
        minHeight: 40,
        transition: "border-color 0.1s, background-color 0.1s",
        // このコンテナ内の layout 変化を外部に伝播させない
        contain: "layout style",
      }}
    >
      <Typography fontSize={16} sx={{ opacity: 0.65, flexShrink: 0, lineHeight: 1 }}>
        {meta.icon}
      </Typography>
      {equippedItem ? (
        <EquipChip eq={equippedItem} compact />
      ) : (
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
          {meta.label}（空き）
        </Typography>
      )}
    </Box>
  );
});

// ===== 倉庫パネル =====
const StoragePanel = memo(function StoragePanel({ items }: { items: Equipment[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: "storage" });
  return (
    <Box
      ref={setNodeRef}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: isOver ? "1.5px solid #ffd740" : "1.5px dashed rgba(255,255,255,0.12)",
        bgcolor: isOver ? "rgba(255,215,64,0.05)" : "rgba(255,255,255,0.02)",
        minHeight: 56,
        transition: "border-color 0.1s, background-color 0.1s",
        contain: "layout style",
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
        📦 倉庫 — ここにドロップで取り外し
      </Typography>
      {items.length === 0 ? (
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>空き</Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {items.map((eq) => <EquipChip key={eq.id} eq={eq} />)}
        </Box>
      )}
    </Box>
  );
});

// ===== 一覧: 正方形アイコンセル =====
const MonsterCell = memo(function MonsterCell({
  monster, onClick, onToggleParty,
}: {
  monster: Monster;
  onClick: () => void;
  onToggleParty: (isParty: boolean) => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        pb: 0.5,
        bgcolor: "background.paper",
        border: "1px solid rgba(255,255,255,0.08)",
        borderTop: `3px solid ${TYPE_COLORS[monster.type] ?? "#7c4dff"}`,
        borderRadius: 2,
        cursor: "pointer",
        position: "relative",
        userSelect: "none",
        transition: "transform 0.12s, box-shadow 0.12s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
          borderColor: "rgba(124,77,255,0.5)",
        },
        "&:active": { transform: "scale(0.97)" },
      }}
    >
      {/* 画像エリア */}
      <Box sx={{ width: "100%", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SpriteImage sprite={monster.sprite} size={48} alt={monster.name} />
      </Box>

      <Typography variant="caption" fontWeight={700} sx={{ fontSize: { xs: 11, sm: 12 }, px: 0.5 }} noWrap>
        {monster.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
        Lv.{monster.level}
      </Typography>

      {/* 出撃チェックボックス */}
      <Box
        onClick={(e) => { e.stopPropagation(); onToggleParty(!monster.isParty); }}
        sx={{ display: "flex", alignItems: "center", mt: 0.25, cursor: "pointer" }}
      >
        <Checkbox
          checked={monster.isParty}
          size="small"
          color="success"
          disableRipple
          sx={{ p: 0.25 }}
        />
        <Typography
          variant="caption"
          sx={{ fontSize: 10, color: monster.isParty ? "success.main" : "text.disabled", lineHeight: 1 }}
        >
          出撃
        </Typography>
      </Box>
    </Box>
  );
});

// ===== 詳細画面 =====
const STAT_ROWS = [
  { icon: "❤️", label: "HP",  baseKey: "maxHp" as const,  bonusKey: null },
  { icon: "💙", label: "MP",  baseKey: "maxMp" as const,  bonusKey: null },
  { icon: "⚔️", label: "ATK", baseKey: "atk"   as const,  bonusKey: "atkBonus" as const },
  { icon: "🛡️", label: "DEF", baseKey: "def"   as const,  bonusKey: "defBonus" as const },
  { icon: "💨", label: "SPD", baseKey: "spd"   as const,  bonusKey: "spdBonus" as const },
] as const;

const MonsterDetail = memo(function MonsterDetail({
  monster,
  allEquipment,
  storageItems,
  onBack,
  onToggleParty,
  onRename,
}: {
  monster: Monster;
  allEquipment: Equipment[];
  storageItems: Equipment[];
  onBack: () => void;
  onToggleParty: (isParty: boolean) => void;
  onRename: (name: string) => void;
}) {
  const [portraitOpen, setPortraitOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const getEquipped = (slot: EquipSlot) => {
    const id = monster.equipped[slot];
    return id ? allEquipment.find((e) => e.id === id) : undefined;
  };

  const bonus = (key: "atkBonus" | "defBonus" | "spdBonus") =>
    SLOT_ORDER.reduce((s, sl) => s + (getEquipped(sl)?.[key] ?? 0), 0);

  const expPct = Math.min(100, Math.round((monster.exp / monster.expNext) * 100));

  return (
    <Box>

      {/* ── ヘッダー: 名前(左) ＋ 正方形スプライト(右) ── */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.75 }}>
            <IconButton size="small" onClick={onBack}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6" fontWeight={700} noWrap sx={{ flex: 1, minWidth: 0 }}>
              {monster.name}
            </Typography>
            <Tooltip title="名前を変更" placement="top" arrow>
              <IconButton
                size="small"
                onClick={() => { setRenameValue(monster.name); setRenameOpen(true); }}
                sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
              >
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", pl: 0.5 }}>
            <Chip label={monster.type} size="small"
              sx={{ bgcolor: TYPE_COLORS[monster.type], color: "#fff", height: 20, fontSize: 11 }} />
            <Chip label={`Lv.${monster.level}`} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
            <Chip
              label={monster.isParty ? "⚔ 出撃中" : "💤 待機中"}
              color={monster.isParty ? "success" : "default"}
              size="small"
              onClick={() => onToggleParty(!monster.isParty)}
              sx={{ height: 20, fontSize: 11, cursor: "pointer" }}
            />
          </Box>
        </Box>

        {/* 正方形ポートレート（タップで拡大） */}
        <Box
          onClick={() => setPortraitOpen(true)}
          sx={{
            width: 88, height: 88, flexShrink: 0, ml: 1.5,
            borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.04)",
            border: `2px solid ${TYPE_COLORS[monster.type] ?? "rgba(255,255,255,0.15)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "box-shadow 0.15s",
            "&:hover": { boxShadow: `0 0 12px ${TYPE_COLORS[monster.type] ?? "rgba(124,77,255,0.6)"}` },
            "&:active": { opacity: 0.8 },
          }}
        >
          <SpriteImage sprite={monster.sprite} size={72} alt={monster.name} />
        </Box>
      </Box>

      {/* ── ステータス ── */}
      <Card sx={{ mb: 1.25 }}>
        <CardContent sx={{ py: "10px !important", px: "12px !important" }}>
          <Typography variant="caption" color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 1, fontSize: 10, mb: 0.75, display: "block" }}>
            STATS
          </Typography>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 0 }}>
            {STAT_ROWS.map(({ icon, label, baseKey, bonusKey }) => {
              const base = monster[baseKey];
              const b = bonusKey ? bonus(bonusKey) : 0;
              return (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.75, py: 0.45 }}>
                  <Typography sx={{ fontSize: 15, lineHeight: 1, width: 20, textAlign: "center", flexShrink: 0 }}>
                    {icon}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ width: 30, fontSize: 11, flexShrink: 0 }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ minWidth: 24 }}>
                    {base + b}
                  </Typography>
                  {b > 0 && (
                    <Typography variant="caption" color="success.main" sx={{ fontSize: 10 }}>+{b}</Typography>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* EXP バー */}
          <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.4 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>⭐ EXP</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                {monster.exp} / {monster.expNext}（{expPct}%）
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={expPct}
              sx={{
                height: 6, borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.08)",
                "& .MuiLinearProgress-bar": { bgcolor: "secondary.main", borderRadius: 3 },
              }}
            />
          </Box>

          {/* 性格・スキル */}
          <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            <Chip label={`😊 ${monster.personality}`} size="small" variant="outlined"
              sx={{ height: 20, fontSize: 10 }} />
            {monster.skills.map((sk) => (
              <Chip key={sk} label={sk} size="small"
                sx={{ height: 20, fontSize: 10, bgcolor: "rgba(124,77,255,0.15)", border: "1px solid rgba(124,77,255,0.3)" }} />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* ── 装備スロット ── */}
      <Card sx={{ mb: 1.25 }}>
        <CardContent sx={{ py: "10px !important", px: "12px !important" }}>
          <Typography variant="caption" color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 1, fontSize: 10, mb: 0.75, display: "block" }}>
            EQUIPMENT
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {SLOT_ORDER.map((slot) => (
              <DroppableSlot
                key={slot}
                id={`${monster.id}:${slot}`}
                slot={slot}
                equippedItem={getEquipped(slot)}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* ── 倉庫 ── */}
      <Card>
        <CardContent sx={{ py: "10px !important", px: "12px !important" }}>
          <Typography variant="caption" color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 1, fontSize: 10, mb: 0.5, display: "block" }}>
            STORAGE
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, display: "block", mb: 0.75 }}>
            スロットへドラッグして装備 / 倉庫へ戻すと取り外し
          </Typography>
          <StoragePanel items={storageItems} />
        </CardContent>
      </Card>

      {/* ── ポートレート拡大モーダル ── */}
      <Modal
        open={portraitOpen}
        onClose={() => setPortraitOpen(false)}
        slots={{ backdrop: Backdrop }}
        slotProps={{ backdrop: { timeout: 300 } }}
      >
        <Fade in={portraitOpen} timeout={300}>
          <Box
            onClick={() => setPortraitOpen(false)}
            sx={{
              position: "fixed", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 2,
            }}
          >
            {/* 画像コンテナ */}
            <Box
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              sx={{
                width: { xs: "72vw", sm: 320 },
                height: { xs: "72vw", sm: 320 },
                maxWidth: 320, maxHeight: 320,
                borderRadius: 3,
                bgcolor: "rgba(20,20,40,0.95)",
                border: `3px solid ${TYPE_COLORS[monster.type] ?? "rgba(124,77,255,0.8)"}`,
                boxShadow: `0 0 40px ${TYPE_COLORS[monster.type] ?? "rgba(124,77,255,0.4)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <SpriteImage
                sprite={monster.sprite}
                size={Math.min(280, typeof window !== "undefined" ? window.innerWidth * 0.64 : 280)}
                alt={monster.name}
              />
            </Box>

            {/* 名前・タイプ */}
            <Box sx={{ textAlign: "center" }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <Typography variant="h6" fontWeight={700} sx={{ color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                {monster.name}
              </Typography>
              <Chip
                label={`${monster.type}  Lv.${monster.level}`}
                size="small"
                sx={{ bgcolor: TYPE_COLORS[monster.type], color: "#fff", mt: 0.5 }}
              />
            </Box>

            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
              タップして閉じる
            </Typography>
          </Box>
        </Fade>
      </Modal>

      {/* ── リネームダイアログ ── */}
      <Dialog
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SpriteImage sprite={monster.sprite} size={32} alt={monster.name} />
            名前を変更
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="新しい名前"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && renameValue.trim()) {
                onRename(renameValue.trim());
                setRenameOpen(false);
              }
              if (e.key === "Escape") setRenameOpen(false);
            }}
            inputProps={{ maxLength: 20 }}
            helperText={`${renameValue.length} / 20`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button size="small" onClick={() => setRenameOpen(false)}>
            キャンセル
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={!renameValue.trim() || renameValue.trim() === monster.name}
            onClick={() => {
              onRename(renameValue.trim());
              setRenameOpen(false);
            }}
          >
            変更する
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
});

// ===== メインページ =====
export default function GuildPage() {
  const { state, dispatch } = useGame();
  const { monsters, equipment } = state;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 遷移方向: null=初回(アニメーションなし), "forward"=詳細へ, "back"=一覧へ
  const transitionDir = useRef<"forward" | "back" | null>(null);

  const selectedMonster = selectedId ? monsters.find((m) => m.id === selectedId) ?? null : null;
  const storageItems = equipment.filter((e) => !e.equippedTo);
  const partyCount = monsters.filter((m) => m.isParty).length;

  const handleSelectMonster = useCallback((id: string) => {
    transitionDir.current = "forward";
    setSelectedId(id);
  }, []);

  const handleBack = useCallback(() => {
    transitionDir.current = "back";
    setSelectedId(null);
  }, []);

  const handleToggleParty = useCallback((monsterId: string, isParty: boolean) => {
    dispatch({ type: "SET_PARTY", payload: { monsterId, isParty } });
  }, [dispatch]);

  const sensors = useSensors(
    // distance: 指/マウスが動き始めた瞬間にドラッグ開始（時間待機なし）
    useSensor(MouseSensor,  { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor,  { activationConstraint: { distance: 4 } })
  );

  // useCallback で参照を固定し、sensors の再生成を防ぐ
  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const equipmentId = active.id as string;
    const overId = over.id as string;

    if (overId === "storage") {
      dispatch({ type: "UNEQUIP", payload: { equipmentId } });
    } else if (overId.includes(":")) {
      const [monsterId, slot] = overId.split(":") as [string, EquipSlot];
      dispatch({ type: "EQUIP", payload: { equipmentId, monsterId, slot } });
    }
  }, [dispatch]);

  return (
    // pointerWithin: ポインタが重なったドロップゾーンのみ有効化。
    // デフォルトの rectIntersection より計算が軽く、操作感も自然
    <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>

        {!selectedMonster && (
          <Box sx={{
            animation: transitionDir.current === "back" ? "slide-in-left 0.28s ease-out" : "none",
          }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="h6">🐾 モンスター管理</Typography>
              <Chip
                label={`出撃中 ${partyCount} / ${monsters.length}`}
                color={partyCount > 0 ? "success" : "default"}
                variant="outlined"
                size="small"
              />
            </Box>
            <Grid container spacing={{ xs: 1, sm: 1.5 }}>
              {monsters.map((m) => (
                <Grid item xs={4} sm={3} md={2} key={m.id}>
                  <MonsterCell
                    monster={m}
                    onClick={() => handleSelectMonster(m.id)}
                    onToggleParty={(isParty) => handleToggleParty(m.id, isParty)}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {selectedMonster && (
          <Box sx={{ animation: "slide-in-right 0.28s ease-out" }}>
            <MonsterDetail
              monster={selectedMonster}
              allEquipment={equipment}
              storageItems={storageItems}
              onBack={handleBack}
              onToggleParty={(isParty) => handleToggleParty(selectedMonster.id, isParty)}
              onRename={(name) => dispatch({ type: "RENAME_MONSTER", payload: { monsterId: selectedMonster.id, name } })}
            />
          </Box>
        )}
      </Box>

      {/* DragPreview は useDndContext で active を直接参照するため、
          親に state を持つ必要がなく、ドラッグ開始時の GuildPage 再レンダリングが発生しない */}
      <DragOverlay dropAnimation={null}>
        <DragPreview />
      </DragOverlay>
    </DndContext>
  );
}
