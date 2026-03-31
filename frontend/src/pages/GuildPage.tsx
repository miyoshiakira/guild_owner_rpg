import { useState } from "react";
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
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  Box, Grid, Card, CardContent, Typography, Chip, LinearProgress,
  Divider, IconButton, Tooltip, useMediaQuery, useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useGame } from "../store/gameStore";
import type { Equipment, EquipSlot, Monster } from "../types/game";

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

// ===== 装備チップ（ドラッグ元） =====
function EquipChip({ eq, compact = false }: { eq: Equipment; compact?: boolean }) {
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
}

// ===== 装備スロット（ドロップ先） =====
function DroppableSlot({ id, slot, equippedItem }: {
  id: string; slot: EquipSlot; equippedItem: Equipment | undefined;
}) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const { active } = useDndContext();
  const activeEq = active?.data.current?.eq as Equipment | undefined;
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
        border: `1.5px dashed ${borderColor}`,
        bgcolor: bg,
        minHeight: 40,
        transition: "border-color 0.12s, background-color 0.12s",
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
}

// ===== 倉庫パネル（取り外し用ドロップゾーン） =====
function StoragePanel({ items }: { items: Equipment[] }) {
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
        transition: "border-color 0.12s, background-color 0.12s",
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
        📦 倉庫 — ここにドロップで取り外し
      </Typography>
      {items.length === 0 ? (
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
          空き
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {items.map((eq) => <EquipChip key={eq.id} eq={eq} />)}
        </Box>
      )}
    </Box>
  );
}

// ===== 一覧: 正方形アイコンセル =====
function MonsterCell({ monster, onClick }: { monster: Monster; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        aspectRatio: "1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
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
          boxShadow: `0 6px 20px rgba(0,0,0,0.4)`,
          borderColor: "rgba(124,77,255,0.5)",
        },
        "&:active": { transform: "scale(0.97)" },
      }}
    >
      {monster.isParty && (
        <Box sx={{
          position: "absolute", top: 6, right: 6,
          width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main",
        }} />
      )}
      <Typography sx={{ fontSize: { xs: 36, sm: 40 }, lineHeight: 1 }}>
        {monster.sprite}
      </Typography>
      <Typography variant="caption" fontWeight={700} sx={{ fontSize: { xs: 11, sm: 12 } }}>
        {monster.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
        Lv.{monster.level}
      </Typography>
    </Box>
  );
}

// ===== 詳細画面 =====
function MonsterDetail({
  monster,
  allEquipment,
  storageItems,
  onBack,
}: {
  monster: Monster;
  allEquipment: Equipment[];
  storageItems: Equipment[];
  onBack: () => void;
}) {
  const getEquipped = (slot: EquipSlot) => {
    const id = monster.equipped[slot];
    return id ? allEquipment.find((e) => e.id === id) : undefined;
  };

  const statBonus = (key: "atkBonus" | "defBonus" | "spdBonus") =>
    SLOT_ORDER.reduce((s, sl) => s + (getEquipped(sl)?.[key] ?? 0), 0);

  const stats = [
    { label: "ATK", base: monster.atk, bonus: statBonus("atkBonus") },
    { label: "DEF", base: monster.def, bonus: statBonus("defBonus") },
    { label: "SPD", base: monster.spd, bonus: statBonus("spdBonus") },
  ];

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton size="small" onClick={onBack} sx={{ mr: 0.5 }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography fontSize={28} sx={{ lineHeight: 1 }}>{monster.sprite}</Typography>
        <Box>
          <Typography variant="h6" sx={{ lineHeight: 1.2 }}>{monster.name}</Typography>
          <Box sx={{ display: "flex", gap: 0.5, mt: 0.25 }}>
            <Chip label={monster.type} size="small"
              sx={{ bgcolor: TYPE_COLORS[monster.type], color: "#fff", height: 18, fontSize: 11 }} />
            <Chip label={`Lv.${monster.level}`} size="small" variant="outlined" sx={{ height: 18, fontSize: 11 }} />
            {monster.isParty && <Chip label="出撃中" color="success" size="small" sx={{ height: 18, fontSize: 11 }} />}
          </Box>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* 左: ステータス + 装備スロット */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>ステータス</Typography>
              <Typography variant="caption" color="text.secondary">HP</Typography>
              <LinearProgress variant="determinate" value={(monster.hp / monster.maxHp) * 100}
                color="error" sx={{ height: 7, borderRadius: 3, mb: 0.5 }} />
              <Typography variant="caption" color="text.secondary">MP</Typography>
              <LinearProgress variant="determinate" value={(monster.mp / monster.maxMp) * 100}
                color="primary" sx={{ height: 7, borderRadius: 3, mb: 1.5 }} />

              <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
                {stats.map(({ label, base, bonus }) => (
                  <Box key={label} sx={{ flex: 1, textAlign: "center", bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1, py: 0.75 }}>
                    <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
                    <Typography variant="body2" fontWeight={700}>{base + bonus}</Typography>
                    {bonus > 0 && (
                      <Typography variant="caption" color="success.main">+{bonus}</Typography>
                    )}
                  </Box>
                ))}
              </Box>

              <Typography variant="caption" color="text.secondary">
                性格: {monster.personality}　スキル: {monster.skills.join(" / ")}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="subtitle2" gutterBottom>装備</Typography>
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
        </Grid>

        {/* 右: 装備品倉庫 */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>装備品倉庫</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                スロットへドラッグして装備 / 倉庫へ戻すと取り外し
              </Typography>
              <StoragePanel items={storageItems} />

              {storageItems.length === 0 && (
                <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 1 }}>
                  すべての装備品がどこかのモンスターに装備されています
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

// ===== メインページ =====
export default function GuildPage() {
  const { state, dispatch } = useGame();
  const { monsters, equipment } = state;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeEquip, setActiveEquip] = useState<Equipment | null>(null);

  const selectedMonster = selectedId ? monsters.find((m) => m.id === selectedId) ?? null : null;
  const storageItems = equipment.filter((e) => !e.equippedTo);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const handleDragStart = (e: DragStartEvent) => {
    setActiveEquip((e.active.data.current?.eq as Equipment) ?? null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveEquip(null);
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
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>

        {/* ===== 一覧画面 ===== */}
        {!selectedMonster && (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>🐾 モンスター管理</Typography>
            <Grid container spacing={{ xs: 1, sm: 1.5 }}>
              {monsters.map((m) => (
                <Grid item xs={4} sm={3} md={2} key={m.id}>
                  <MonsterCell monster={m} onClick={() => setSelectedId(m.id)} />
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* ===== 詳細画面 ===== */}
        {selectedMonster && (
          <MonsterDetail
            monster={selectedMonster}
            allEquipment={equipment}
            storageItems={storageItems}
            onBack={() => setSelectedId(null)}
          />
        )}
      </Box>

      {/* ドラッグ中フローティングプレビュー */}
      <DragOverlay dropAnimation={null}>
        {activeEquip && (
          <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 0.75,
            px: 1.5, py: 0.75,
            bgcolor: "background.paper",
            border: "1.5px solid", borderColor: "primary.main",
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(124,77,255,0.5)",
            fontSize: 13, fontWeight: 600,
            pointerEvents: "none", whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 18 }}>{activeEquip.sprite}</span>
            {activeEquip.name}
          </Box>
        )}
      </DragOverlay>
    </DndContext>
  );
}
