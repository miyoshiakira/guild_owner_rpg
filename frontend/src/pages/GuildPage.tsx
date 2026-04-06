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
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Box, Grid, Card, CardContent, Typography, Chip,
  IconButton, Tooltip, Checkbox, LinearProgress,
  Modal, Backdrop, Fade,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField,
  ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { useGame } from "../store/gameStore";
import type { Equipment, EquipSlot, Monster } from "../types/game";
import { SpriteImage } from "../components/SpriteImage";
import { SKILL_MAP } from "../data/masters/skillMaster";
import { PERSONALITY_MAP } from "../data/masters/personalityMaster";
import { TYPE_GROWTH_MAP } from "../data/masters/typeGrowthMaster";
import { RACE_MAP } from "../data/masters/raceMaster";
import { ENEMY_MASTER } from "../data/masters/enemyMaster";
import type { GrowthCoeff } from "../data/masters/personalityMaster";

/** モンスター名 → 種族 のフォールバック辞書（旧セーブデータ対応） */
const RACE_BY_NAME: Record<string, string> = Object.fromEntries(
  ENEMY_MASTER.map((e) => [e.name, e.race])
);
import type { SkillMaster } from "../types/masters";

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
const TYPE_EMOJI: Record<string, string> = {
  水: "💧", 地: "🌍", 光: "✨", 炎: "🔥", 闇: "🌑",
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

// ===== パーティ順: ドラッグ可能な行アイテム =====
const SortablePartyItem = memo(function SortablePartyItem({
  monster,
  index,
}: {
  monster: Monster;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: monster.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 100 : "auto",
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.25,
        py: 0.75,
        bgcolor: isDragging ? "rgba(124,77,255,0.12)" : "background.paper",
        border: "1px solid",
        borderColor: isDragging ? "primary.main" : "rgba(255,255,255,0.1)",
        borderLeft: `4px solid ${TYPE_COLORS[monster.type] ?? "#7c4dff"}`,
        borderRadius: 1.5,
        mb: 0.75,
        userSelect: "none",
        touchAction: "none",
      }}
    >
      {/* ドラッグハンドル */}
      <Box
        {...attributes}
        {...listeners}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: isDragging ? "grabbing" : "grab",
          color: "text.disabled",
          flexShrink: 0,
          px: 0.25,
          "&:hover": { color: "text.secondary" },
        }}
      >
        <DragHandleIcon fontSize="small" />
      </Box>

      {/* 順番 */}
      <Typography
        variant="caption"
        sx={{
          width: 20,
          textAlign: "center",
          fontWeight: 700,
          color: "text.secondary",
          flexShrink: 0,
        }}
      >
        {index + 1}
      </Typography>

      {/* スプライト */}
      <SpriteImage sprite={monster.sprite} size={32} alt={monster.name} />

      {/* 名前・レベル */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ fontSize: 13 }}>
          {monster.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
          Lv.{monster.level}
          <Chip
            label={monster.type}
            size="small"
            sx={{
              ml: 0.75,
              height: 16,
              fontSize: 10,
              bgcolor: (TYPE_COLORS[monster.type] ?? "#7c4dff") + "33",
              color: TYPE_COLORS[monster.type] ?? "#7c4dff",
              border: "none",
            }}
          />
        </Typography>
      </Box>
    </Box>
  );
});

// ===== パーティ順セクション =====
function PartyOrderSection({
  partyMonsters,
  onReorder,
}: {
  partyMonsters: Monster[];
  onReorder: (newOrder: string[]) => void;
}) {
  const [items, setItems] = useState<string[]>(() => partyMonsters.map((m) => m.id));

  // partyMonsters が外から変わったとき（パーティ変更など）は同期する
  const prevIdsRef = useRef<string>(JSON.stringify(partyMonsters.map((m) => m.id)));
  const currentIds = JSON.stringify(partyMonsters.map((m) => m.id));
  if (prevIdsRef.current !== currentIds) {
    prevIdsRef.current = currentIds;
    // 既存の順序を維持しつつ追加/削除を反映
    const newSet = new Set(partyMonsters.map((m) => m.id));
    const merged = [
      ...items.filter((id) => newSet.has(id)),
      ...partyMonsters.filter((m) => !items.includes(m.id)).map((m) => m.id),
    ];
    setItems(merged);
  }

  const sortSensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(active.id as string);
    const newIndex = items.indexOf(over.id as string);
    const newOrder = arrayMove(items, oldIndex, newIndex);
    setItems(newOrder);
    onReorder(newOrder);
  }, [items, onReorder]);

  if (partyMonsters.length === 0) return null;

  const monsterMap = Object.fromEntries(partyMonsters.map((m) => [m.id, m]));

  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: 12 }}>
        ☰ パーティ順（ドラッグで並び替え）
      </Typography>
      <DndContext
        sensors={sortSensors}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((id, idx) =>
            monsterMap[id] ? (
              <SortablePartyItem key={id} monster={monsterMap[id]} index={idx} />
            ) : null
          )}
        </SortableContext>
      </DndContext>
    </Box>
  );
}

// ===== 一覧: 正方形アイコンセル =====
const MonsterCell = memo(function MonsterCell({
  monster, onClick, onToggleParty, breedState,
}: {
  monster: Monster;
  onClick: () => void;
  onToggleParty: (isParty: boolean) => void;
  /** 配合モード時の表示状態 */
  breedState?: "base" | "eligible" | "ineligible";
}) {
  const isInBreedMode = breedState !== undefined;
  const isDisabled = breedState === "ineligible";
  const isBase = breedState === "base";

  return (
    <Box
      onClick={isDisabled ? undefined : onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        pb: 0.5,
        bgcolor: isBase ? "rgba(255,193,7,0.12)" : "background.paper",
        border: isBase
          ? "2px solid #ffc107"
          : "1px solid rgba(255,255,255,0.08)",
        borderTop: `3px solid ${TYPE_COLORS[monster.type] ?? "#7c4dff"}`,
        borderRadius: 2,
        cursor: isDisabled ? "not-allowed" : "pointer",
        position: "relative",
        userSelect: "none",
        opacity: isDisabled ? 0.38 : 1,
        transition: "transform 0.12s, box-shadow 0.12s",
        ...(!isDisabled && !isInBreedMode && {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
            borderColor: "rgba(124,77,255,0.5)",
          },
          "&:active": { transform: "scale(0.97)" },
        }),
        ...(!isDisabled && isInBreedMode && !isBase && {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(102,187,106,0.4)",
            borderColor: "rgba(102,187,106,0.7)",
          },
          "&:active": { transform: "scale(0.97)" },
        }),
      }}
    >
      {/* 配合ベース選択済みバッジ */}
      {isBase && (
        <Box sx={{
          position: "absolute", top: 4, right: 4, zIndex: 1,
          bgcolor: "#ffc107", borderRadius: "50%",
          width: 16, height: 16,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700, color: "#000",
        }}>
          ⚗
        </Box>
      )}
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

      {/* HP/MPバー */}
      <Box sx={{ width: "100%", px: 0.75, display: "flex", flexDirection: "column", gap: 0.35 }}>
        <LinearProgress
          variant="determinate"
          value={monster.maxHp > 0 ? Math.min(100, (monster.hp / monster.maxHp) * 100) : 100}
          sx={{
            height: 3, borderRadius: 2,
            bgcolor: "rgba(255,255,255,0.1)",
            "& .MuiLinearProgress-bar": { bgcolor: "#ef5350", borderRadius: 2 },
          }}
        />
        {monster.maxMp > 0 && (
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (monster.mp / monster.maxMp) * 100)}
            sx={{
              height: 3, borderRadius: 2,
              bgcolor: "rgba(255,255,255,0.1)",
              "& .MuiLinearProgress-bar": { bgcolor: "#42a5f5", borderRadius: 2 },
            }}
          />
        )}
      </Box>

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
type StatRow = {
  icon: string;
  label: string;
  baseKey: keyof Monster;
  currentKey?: keyof Monster;
  bonusKey?: "atkBonus" | "defBonus" | "spdBonus";
};
const STAT_ROWS: StatRow[] = [
  { icon: "❤️", label: "HP",  baseKey: "maxHp", currentKey: "hp"  },
  { icon: "💙", label: "MP",  baseKey: "maxMp", currentKey: "mp"  },
  { icon: "⚔️", label: "ATK", baseKey: "atk",   bonusKey: "atkBonus" },
  { icon: "🛡️", label: "DEF", baseKey: "def",   bonusKey: "defBonus" },
  { icon: "💨", label: "SPD", baseKey: "spd",   bonusKey: "spdBonus" },
];

const MonsterDetail = memo(function MonsterDetail({
  monster,
  allEquipment,
  storageItems,
  onBack,
  onToggleParty,
  onRename,
  onDelete,
  isLastMember,
}: {
  monster: Monster;
  allEquipment: Equipment[];
  storageItems: Equipment[];
  onBack: () => void;
  onToggleParty: (isParty: boolean) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  isLastMember: boolean;
}) {
  const [portraitOpen, setPortraitOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [skillDetail, setSkillDetail] = useState<SkillMaster | null>(null);
  const [growthModal, setGrowthModal] = useState<{
    title: string; emoji: string; description: string; growth: GrowthCoeff;
  } | null>(null);

  const openPersonalityGrowth = () => {
    const p = PERSONALITY_MAP[monster.personality];
    if (p) setGrowthModal({ title: p.name, emoji: "😊", description: p.description, growth: p.growth });
  };
  const openTypeGrowth = () => {
    const t = TYPE_GROWTH_MAP[monster.type];
    if (t) setGrowthModal({ title: `${monster.type}属性`, emoji: TYPE_EMOJI[monster.type] ?? "✨", description: t.description, growth: t.growth });
  };
  const openRaceGrowth = () => {
    const raceName = monster.race ?? RACE_BY_NAME[monster.name];
    const r = raceName ? RACE_MAP[raceName] : undefined;
    if (r) setGrowthModal({ title: r.name, emoji: "🧬", description: r.description, growth: r.growth });
  };

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
            <Tooltip title={isLastMember ? "最後の一人は削除できません" : "メンバーを削除"} placement="top" arrow>
              <span>
                <IconButton
                  size="small"
                  disabled={isLastMember}
                  onClick={() => setDeleteConfirmOpen(true)}
                  sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", pl: 0.5 }}>
            <Chip
              label={`${TYPE_EMOJI[monster.type] ?? ""} ${monster.type}`}
              size="small"
              onClick={openTypeGrowth}
              sx={{ bgcolor: TYPE_COLORS[monster.type], color: "#fff", height: 20, fontSize: 11, cursor: "pointer" }}
            />
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
            {STAT_ROWS.map(({ icon, label, baseKey, currentKey, bonusKey }) => {
              const base = monster[baseKey] as number;
              const b = bonusKey ? bonus(bonusKey) : 0;
              const current = currentKey != null ? monster[currentKey] as number : null;
              return (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.75, py: 0.45 }}>
                  <Typography sx={{ fontSize: 15, lineHeight: 1, width: 20, textAlign: "center", flexShrink: 0 }}>
                    {icon}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ width: 30, fontSize: 11, flexShrink: 0 }}>
                    {label}
                  </Typography>
                  {current != null ? (
                    <Typography variant="body2" fontWeight={700} sx={{ minWidth: 24, fontSize: 12 }}>
                      <Box component="span" sx={{ color: current < base * 0.3 ? "error.main" : current < base * 0.7 ? "warning.main" : "inherit" }}>
                        {current}
                      </Box>
                      <Box component="span" sx={{ color: "text.disabled", fontSize: 10 }}>/{base}</Box>
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="body2" fontWeight={700} sx={{ minWidth: 24 }}>
                        {base + b}
                      </Typography>
                      {b > 0 && (
                        <Typography variant="caption" color="success.main" sx={{ fontSize: 10 }}>+{b}</Typography>
                      )}
                    </>
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

          {/* 配合回数 */}
          {(monster.breedCount ?? 0) > 0 && (
            <Box sx={{ mt: 0.75 }}>
              <Chip
                label={`⚗ 配合 ${monster.breedCount}回`}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: 10, borderColor: "rgba(255,193,7,0.6)", color: "#ffc107" }}
              />
            </Box>
          )}

          {/* 性格・種族・スキル */}
          <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            <Chip
              label={`😊 ${monster.personality}`}
              size="small" variant="outlined"
              onClick={openPersonalityGrowth}
              sx={{ height: 20, fontSize: 10, cursor: "pointer",
                "&:hover": { borderColor: "primary.main", color: "primary.light" } }}
            />
            {(() => {
              const raceName = monster.race ?? RACE_BY_NAME[monster.name];
              return raceName ? (
                <Chip
                  label={`🧬 ${raceName}`}
                  size="small" variant="outlined"
                  onClick={openRaceGrowth}
                  sx={{ height: 20, fontSize: 10, cursor: "pointer",
                    "&:hover": { borderColor: "secondary.main", color: "secondary.light" } }}
                />
              ) : null;
            })()}
            {monster.skills.map((sk) => (
              <Chip key={sk} label={sk} size="small"
                onClick={() => setSkillDetail(SKILL_MAP[sk] ?? { id: "", name: sk, power: 0, description: "詳細不明", mpCost: 0 })}
                sx={{ height: 20, fontSize: 10, bgcolor: "rgba(124,77,255,0.15)", border: "1px solid rgba(124,77,255,0.3)", cursor: "pointer" }} />
            ))}
          </Box>

          {/* 成長係数モーダル */}
          <Dialog
            open={growthModal !== null}
            onClose={() => setGrowthModal(null)}
            PaperProps={{ sx: { bgcolor: "background.paper", borderRadius: 2, minWidth: 270, maxWidth: 320 } }}
          >
            {growthModal && (
              <>
                <DialogTitle sx={{ pb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: "50%",
                    bgcolor: "rgba(124,77,255,0.15)", border: "1px solid rgba(124,77,255,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, flexShrink: 0,
                  }}>{growthModal.emoji}</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{growthModal.title}</Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: "4px !important" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                    {growthModal.description}
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
                    {(
                      [
                        { key: "hp",  label: "HP",  icon: "❤️" },
                        { key: "mp",  label: "MP",  icon: "💙" },
                        { key: "atk", label: "ATK", icon: "⚔️" },
                        { key: "def", label: "DEF", icon: "🛡️" },
                        { key: "spd", label: "SPD", icon: "💨" },
                      ] as { key: keyof GrowthCoeff; label: string; icon: string }[]
                    ).map(({ key, label, icon }) => {
                      const val = growthModal.growth[key];
                      const pct = Math.round((val - 1) * 100);
                      const isUp = val > 1.0;
                      const isDn = val < 1.0;
                      const barColor = isUp ? "#4caf50" : isDn ? "#f44336" : "rgba(255,255,255,0.25)";
                      const barWidth = isUp
                        ? Math.min(100, (val - 1) * 200)
                        : isDn
                          ? Math.min(100, (1 - val) * 200)
                          : 0;
                      return (
                        <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography sx={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{icon}</Typography>
                          <Typography variant="caption" sx={{ width: 28, fontWeight: 600, flexShrink: 0 }}>{label}</Typography>
                          {/* バー */}
                          <Box sx={{ flex: 1, height: 6, bgcolor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                            <Box sx={{
                              height: "100%", borderRadius: 3,
                              bgcolor: barColor,
                              width: `${barWidth}%`,
                              float: isDn ? "right" : "left",
                            }} />
                          </Box>
                          {/* 数値 */}
                          <Typography variant="caption" sx={{
                            width: 46, textAlign: "right", fontWeight: 700, flexShrink: 0,
                            color: isUp ? "success.light" : isDn ? "error.light" : "text.secondary",
                            fontSize: 12,
                          }}>
                            {val.toFixed(1)}×{pct !== 0 && (
                              <Box component="span" sx={{ fontSize: 9, ml: 0.3 }}>
                                ({pct > 0 ? "+" : ""}{pct}%)
                              </Box>
                            )}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </DialogContent>
                <DialogActions sx={{ pt: 0 }}>
                  <Button size="small" onClick={() => setGrowthModal(null)}>閉じる</Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* スキル詳細モーダル */}
          <Dialog
            open={skillDetail !== null}
            onClose={() => setSkillDetail(null)}
            PaperProps={{ sx: { bgcolor: "background.paper", borderRadius: 2, minWidth: 260, maxWidth: 340 } }}
          >
            {skillDetail && (
              <>
                <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: "50%",
                    bgcolor: "rgba(124,77,255,0.2)", border: "1px solid rgba(124,77,255,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, flexShrink: 0,
                  }}>⚡</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{skillDetail.name}</Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: "0 !important" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {skillDetail.description}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Box sx={{
                      flex: 1, textAlign: "center", py: 1, borderRadius: 1,
                      bgcolor: skillDetail.power > 0 ? "rgba(244,67,54,0.12)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${skillDetail.power > 0 ? "rgba(244,67,54,0.3)" : "rgba(255,255,255,0.1)"}`,
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: 10 }}>威力</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: skillDetail.power > 0 ? "error.light" : "text.disabled" }}>
                        {skillDetail.power > 0 ? skillDetail.power : "—"}
                      </Typography>
                    </Box>
                    <Box sx={{
                      flex: 1, textAlign: "center", py: 1, borderRadius: 1,
                      bgcolor: skillDetail.mpCost > 0 ? "rgba(33,150,243,0.12)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${skillDetail.mpCost > 0 ? "rgba(33,150,243,0.3)" : "rgba(255,255,255,0.1)"}`,
                    }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: 10 }}>消費MP</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: skillDetail.mpCost > 0 ? "info.light" : "text.disabled" }}>
                        {skillDetail.mpCost > 0 ? skillDetail.mpCost : "—"}
                      </Typography>
                    </Box>
                  </Box>
                </DialogContent>
                <DialogActions sx={{ pt: 0 }}>
                  <Button size="small" onClick={() => setSkillDetail(null)}>閉じる</Button>
                </DialogActions>
              </>
            )}
          </Dialog>
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

      {/* ── メンバー削除 確認ダイアログ ── */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 300, border: "1px solid rgba(244,67,54,0.4)" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          🗑️ メンバーを削除しますか？
        </DialogTitle>
        <DialogContent sx={{ pt: "0 !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <SpriteImage sprite={monster.sprite} size={32} alt={monster.name} />
            <Typography variant="body1" fontWeight={700}>{monster.name}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            ギルドから追放されます。装備品は倉庫に戻ります。
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            この操作は取り消せません。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: "text.secondary" }}>
            キャンセル
          </Button>
          <Button variant="contained" color="error" onClick={() => { setDeleteConfirmOpen(false); onDelete(); }}>
            削除する
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
  const [viewMode, setViewMode] = useState<"members" | "party">("members");
  // 遷移方向: null=初回(アニメーションなし), "forward"=詳細へ, "back"=一覧へ
  const transitionDir = useRef<"forward" | "back" | null>(null);

  // ── 配合モード ──
  const [breedStep, setBreedStep] = useState<"off" | "base" | "partner">("off");
  const [breedBase, setBreedBase] = useState<(typeof monsters)[0] | null>(null);
  const [breedPartner, setBreedPartner] = useState<(typeof monsters)[0] | null>(null);
  const [breedConfirmOpen, setBreedConfirmOpen] = useState(false);

  const exitBreedMode = useCallback(() => {
    setBreedStep("off");
    setBreedBase(null);
    setBreedPartner(null);
    setBreedConfirmOpen(false);
  }, []);

  const handleBreedConfirm = useCallback(() => {
    if (!breedBase || !breedPartner) return;
    dispatch({ type: "BREED_MONSTER", payload: { baseId: breedBase.id, partnerId: breedPartner.id } });
    dispatch({ type: "NOTIFY", payload: { message: `${breedBase.name} の配合が完了しました！`, severity: "success" } });
    exitBreedMode();
  }, [breedBase, breedPartner, dispatch, exitBreedMode]);

  /** 配合モード時の各セルの状態 */
  const getBreedState = useCallback((m: (typeof monsters)[0]) => {
    if (breedStep === "off") return undefined;
    if (breedStep === "base") return m.level >= 10 ? "eligible" : "ineligible";
    // partner 選択中
    if (m.id === breedBase?.id) return "base" as const;
    return m.level >= 10 ? "eligible" : "ineligible";
  }, [breedStep, breedBase]);

  const selectedMonster = selectedId ? monsters.find((m) => m.id === selectedId) ?? null : null;
  const storageItems = equipment.filter((e) => !e.equippedTo);
  const partyCount = monsters.filter((m) => m.isParty).length;

  const handleSelectMonster = useCallback((id: string) => {
    transitionDir.current = "forward";
    setSelectedId(id);
  }, []);

  /** モンスターセルクリック: 通常モードは詳細へ、配合モードは選択処理 */
  const handleMonsterCellClick = useCallback((m: (typeof monsters)[0]) => {
    if (breedStep === "off") {
      handleSelectMonster(m.id);
      return;
    }
    if (breedStep === "base") {
      if (m.level < 10) return;
      setBreedBase(m);
      setBreedStep("partner");
      return;
    }
    if (breedStep === "partner") {
      if (m.level < 10 || m.id === breedBase?.id) return;
      setBreedPartner(m);
      setBreedConfirmOpen(true);
    }
  }, [breedStep, breedBase, handleSelectMonster]);

  const handleBack = useCallback(() => {
    transitionDir.current = "back";
    setSelectedId(null);
  }, []);

  const handleToggleParty = useCallback((monsterId: string, isParty: boolean) => {
    dispatch({ type: "SET_PARTY", payload: { monsterId, isParty } });
  }, [dispatch]);

  const handleReorder = useCallback((newOrder: string[]) => {
    dispatch({ type: "REORDER_MONSTERS", payload: newOrder });
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
            {/* ── ヘッダー ── */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography variant="h6">🐾 モンスター管理</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={`出撃中 ${partyCount} / ${monsters.length}`}
                  color={partyCount > 0 ? "success" : "default"}
                  variant="outlined"
                  size="small"
                />
                <Button
                  size="small"
                  variant={breedStep !== "off" ? "contained" : "outlined"}
                  color={breedStep !== "off" ? "warning" : "inherit"}
                  onClick={breedStep !== "off" ? exitBreedMode : () => setBreedStep("base")}
                  sx={{ fontSize: 11, py: 0.4, px: 1, minWidth: 0, whiteSpace: "nowrap" }}
                >
                  {breedStep !== "off" ? "✕ キャンセル" : "⚗ 配合"}
                </Button>
              </Box>
            </Box>

            {/* ── 配合モード バナー ── */}
            {breedStep !== "off" && (
              <Box sx={{
                mb: 1.5, px: 1.5, py: 1,
                bgcolor: "rgba(255,193,7,0.08)",
                border: "1px solid rgba(255,193,7,0.4)",
                borderRadius: 1.5,
              }}>
                <Typography variant="body2" color="warning.main" fontWeight={600} sx={{ fontSize: 12 }}>
                  {breedStep === "base"
                    ? "⚗ ベースにするモンスターを選んでください（Lv10以上）"
                    : `⚗ 「${breedBase?.name}」と配合するモンスターを選んでください（Lv10以上・別モンスター）`}
                </Typography>
              </Box>
            )}

            {/* ── 表示切り替えトグル ── */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => { if (v) setViewMode(v); }}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
            >
              <ToggleButton value="members" sx={{ fontSize: 12, py: 0.6 }}>
                メンバー一覧
              </ToggleButton>
              <ToggleButton value="party" sx={{ fontSize: 12, py: 0.6 }}>
                出撃管理
              </ToggleButton>
            </ToggleButtonGroup>

            {/* ── メンバー一覧 ── */}
            {viewMode === "members" && (
              <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                {monsters.map((m) => (
                  <Grid item xs={4} sm={3} md={2} key={m.id}>
                    <MonsterCell
                      monster={m}
                      onClick={() => handleMonsterCellClick(m)}
                      onToggleParty={(isParty) => handleToggleParty(m.id, isParty)}
                      breedState={getBreedState(m)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* ── 出撃管理 ── */}
            {viewMode === "party" && (
              <PartyOrderSection
                partyMonsters={monsters.filter((m) => m.isParty)}
                onReorder={handleReorder}
              />
            )}
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
              onDelete={() => {
                dispatch({ type: "REMOVE_MONSTER", payload: { monsterId: selectedMonster.id } });
                handleBack();
              }}
              isLastMember={monsters.length === 1}
            />
          </Box>
        )}
      </Box>

      {/* DragPreview は useDndContext で active を直接参照するため、
          親に state を持つ必要がなく、ドラッグ開始時の GuildPage 再レンダリングが発生しない */}
      <DragOverlay dropAnimation={null}>
        <DragPreview />
      </DragOverlay>

      {/* ── 配合確認ダイアログ ── */}
      <Dialog
        open={breedConfirmOpen}
        onClose={() => { setBreedConfirmOpen(false); setBreedPartner(null); }}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 320, border: "1px solid rgba(255,193,7,0.4)" } }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>⚗ 配合の確認</DialogTitle>
        <DialogContent sx={{ pt: "0 !important" }}>
          {breedBase && breedPartner && (() => {
            const combinedSkills = [...new Set([...breedBase.skills, ...breedPartner.skills])];
            return (
              <Box>
                {/* 配合の組み合わせ */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mb: 2 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <SpriteImage sprite={breedBase.sprite} size={48} alt={breedBase.name} />
                    <Typography variant="caption" display="block" fontWeight={700}>{breedBase.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Lv.{breedBase.level}</Typography>
                  </Box>
                  <Typography variant="h6" color="warning.main">⚗</Typography>
                  <Box sx={{ textAlign: "center" }}>
                    <SpriteImage sprite={breedPartner.sprite} size={48} alt={breedPartner.name} />
                    <Typography variant="caption" display="block" fontWeight={700}>{breedPartner.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Lv.{breedPartner.level}</Typography>
                  </Box>
                </Box>

                {/* 配合後の変化 */}
                <Box sx={{ bgcolor: "rgba(255,193,7,0.06)", border: "1px solid rgba(255,193,7,0.25)", borderRadius: 1.5, p: 1.25, mb: 1.5 }}>
                  <Typography variant="caption" color="warning.main" fontWeight={700} display="block" sx={{ mb: 0.75 }}>
                    配合後の {breedBase.name}
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 0.75 }}>
                    <Chip label="Lv1 にリセット" size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                    <Chip label={`配合 ${(breedBase.breedCount ?? 0) + 1}回目`} size="small" sx={{ height: 18, fontSize: 10, bgcolor: "rgba(255,193,7,0.15)" }} />
                    <Chip label={`性格: ${breedBase.personality} or ${breedPartner.personality}`} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                    ステータスボーナス（相手の1/10）:
                    HP+{Math.floor(breedPartner.maxHp / 10)} / MP+{Math.floor(breedPartner.maxMp / 10)} /
                    ATK+{Math.floor(breedPartner.atk / 10)} / DEF+{Math.floor(breedPartner.def / 10)} / SPD+{Math.floor(breedPartner.spd / 10)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                    引き継ぎスキル（{combinedSkills.length}個）:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}>
                    {combinedSkills.map((sk) => (
                      <Chip key={sk} label={sk} size="small" sx={{ height: 18, fontSize: 10, bgcolor: "rgba(124,77,255,0.15)" }} />
                    ))}
                  </Box>
                </Box>

                <Typography variant="caption" color="error">
                  ※ {breedBase.name} はパーティから外れます。この操作は取り消せません。
                </Typography>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => { setBreedConfirmOpen(false); setBreedPartner(null); }} sx={{ color: "text.secondary" }}>
            キャンセル
          </Button>
          <Button variant="contained" color="warning" onClick={handleBreedConfirm}>
            配合する
          </Button>
        </DialogActions>
      </Dialog>
    </DndContext>
  );
}
