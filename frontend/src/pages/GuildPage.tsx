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
  Divider, useMediaQuery, useTheme, Tooltip,
} from "@mui/material";
import { useGame } from "../store/gameStore";
import type { Equipment, EquipSlot, Monster } from "../types/game";

// ===== スロット定義 =====
const SLOT_META: Record<EquipSlot, { label: string; icon: string }> = {
  weapon:    { label: "武器",      icon: "⚔️" },
  armor:     { label: "防具",      icon: "🛡️" },
  accessory: { label: "アクセサリ", icon: "💍" },
};
const SLOT_ORDER: EquipSlot[] = ["weapon", "armor", "accessory"];

// ===== 装備品チップ (ドラッグ元) =====
function EquipChip({ equipment, compact = false }: { equipment: Equipment; compact?: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: equipment.id,
    data: { equipment },
  });
  return (
    <Tooltip title={equipment.effect} placement="top" arrow>
      <Box
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          px: compact ? 0.75 : 1,
          py: 0.5,
          bgcolor: "rgba(124,77,255,0.15)",
          border: "1px solid rgba(124,77,255,0.4)",
          borderRadius: 1.5,
          cursor: isDragging ? "grabbing" : "grab",
          opacity: isDragging ? 0.3 : 1,
          fontSize: compact ? 12 : 13,
          fontWeight: 600,
          whiteSpace: "nowrap",
          userSelect: "none",
          touchAction: "none",
          "&:hover": { bgcolor: "rgba(124,77,255,0.3)", borderColor: "primary.main" },
        }}
      >
        <span style={{ fontSize: compact ? 14 : 16 }}>{equipment.sprite}</span>
        {equipment.name}
      </Box>
    </Tooltip>
  );
}

// ===== ドロップスロット =====
interface DroppableSlotProps {
  id: string;
  slot: EquipSlot;
  equippedItem: Equipment | undefined;
}

function DroppableSlot({ id, slot, equippedItem }: DroppableSlotProps) {
  const { isOver, setNodeRef } = useDroppable({ id });
  const { active } = useDndContext();
  const meta = SLOT_META[slot];

  // ドラッグ中アイテムとスロット種別の互換チェック
  const activeEquip = active?.data.current?.equipment as Equipment | undefined;
  const isCompatible = activeEquip ? activeEquip.slot === slot : true;
  const showInvalid = isOver && !isCompatible;
  const showValid   = isOver && isCompatible;

  return (
    <Box
      ref={setNodeRef}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        px: 1,
        py: 0.75,
        borderRadius: 1.5,
        border: showInvalid
          ? "1.5px solid rgba(244,67,54,0.8)"
          : showValid
          ? "1.5px solid #ffd740"
          : "1.5px dashed rgba(255,255,255,0.18)",
        bgcolor: showInvalid
          ? "rgba(244,67,54,0.08)"
          : showValid
          ? "rgba(255,215,64,0.08)"
          : "rgba(255,255,255,0.03)",
        minHeight: 36,
        transition: "border-color 0.15s, background-color 0.15s",
      }}
    >
      <Typography fontSize={15} sx={{ opacity: 0.7, flexShrink: 0 }}>{meta.icon}</Typography>
      {equippedItem ? (
        <EquipChip equipment={equippedItem} compact />
      ) : (
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
          {meta.label}（空き）
        </Typography>
      )}
    </Box>
  );
}

// ===== モンスターカード =====
function MonsterCard({ monster, equipment }: { monster: Monster; equipment: Equipment[] }) {
  const hpPct = (monster.hp / monster.maxHp) * 100;

  const getEquipped = (slot: EquipSlot) =>
    monster.equipped[slot]
      ? equipment.find((e) => e.id === monster.equipped[slot])
      : undefined;

  const totalAtk = monster.atk + SLOT_ORDER.reduce((s, sl) => s + (getEquipped(sl)?.atkBonus ?? 0), 0);
  const totalDef = monster.def + SLOT_ORDER.reduce((s, sl) => s + (getEquipped(sl)?.defBonus ?? 0), 0);
  const totalSpd = monster.spd + SLOT_ORDER.reduce((s, sl) => s + (getEquipped(sl)?.spdBonus ?? 0), 0);

  return (
    <Card sx={{ height: "100%", position: "relative" }}>
      {monster.isParty && (
        <Chip label="出撃中" color="success" size="small"
          sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }} />
      )}
      <CardContent sx={{ pb: "12px !important" }}>
        {/* 名前・スプライト */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography fontSize={28}>{monster.sprite}</Typography>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>{monster.name}</Typography>
            <Chip label={`Lv.${monster.level}`} size="small" variant="outlined" sx={{ height: 18, fontSize: 11 }} />
          </Box>
        </Box>

        {/* HP */}
        <Typography variant="caption" color="text.secondary">HP</Typography>
        <LinearProgress variant="determinate" value={hpPct} color="error"
          sx={{ height: 5, borderRadius: 3, mb: 1 }} />

        {/* 装備スロット */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 1 }}>
          {SLOT_ORDER.map((slot) => (
            <DroppableSlot
              key={slot}
              id={`${monster.id}:${slot}`}
              slot={slot}
              equippedItem={getEquipped(slot)}
            />
          ))}
        </Box>

        <Divider sx={{ mb: 0.75 }} />

        {/* ステータス（装備込み） */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {[["ATK", monster.atk, totalAtk], ["DEF", monster.def, totalDef], ["SPD", monster.spd, totalSpd]].map(
            ([k, base, total]) => (
              <Box key={k} sx={{ flex: 1, textAlign: "center", bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1, py: 0.5 }}>
                <Typography variant="caption" color="text.secondary" display="block">{k}</Typography>
                <Typography variant="body2" fontWeight={700} fontSize={12}>
                  {total}
                  {total !== base && (
                    <Typography component="span" variant="caption" color="success.main">
                      {" "}(+{(total as number) - (base as number)})
                    </Typography>
                  )}
                </Typography>
              </Box>
            )
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// ===== 倉庫（アンイクイップ用ドロップゾーン） =====
function EquipmentStorage({ storageItems }: { storageItems: Equipment[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: "storage" });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: isOver
          ? "2px solid rgba(255,215,64,0.6)"
          : "2px dashed rgba(255,255,255,0.12)",
        bgcolor: isOver ? "rgba(255,215,64,0.05)" : "rgba(255,255,255,0.02)",
        minHeight: 60,
        transition: "border-color 0.15s, background-color 0.15s",
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
        📦 装備品倉庫（ここにドロップで取り外し）
      </Typography>
      {storageItems.length === 0 ? (
        <Typography variant="caption" color="text.disabled" sx={{ fontStyle: "italic" }}>
          倉庫は空です
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {storageItems.map((eq) => (
            <EquipChip key={eq.id} equipment={eq} />
          ))}
        </Box>
      )}
    </Box>
  );
}

// ===== メインページ =====
export default function GuildPage() {
  const { state, dispatch } = useGame();
  const { monsters, equipment } = state;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [activeEquip, setActiveEquip] = useState<Equipment | null>(null);

  const storageItems = equipment.filter((e) => !e.equippedTo);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const eq = event.active.data.current?.equipment as Equipment | undefined;
    setActiveEquip(eq ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveEquip(null);
    const { active, over } = event;
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

  const monsterGrid = (
    <Grid container spacing={2}>
      {monsters.map((m) => (
        <Grid item xs={12} sm={6} xl={4} key={m.id}>
          <MonsterCard monster={m} equipment={equipment} />
        </Grid>
      ))}
    </Grid>
  );

  const storage = <EquipmentStorage storageItems={storageItems} />;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🐾 モンスター管理
        </Typography>

        {isMobile ? (
          // モバイル: 倉庫を上部に固定、モンスター一覧を下に
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {storage}
            {monsterGrid}
          </Box>
        ) : (
          // PC: モンスターグリッド左、倉庫右サイドパネル
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>{monsterGrid}</Box>
            <Box sx={{ width: 260, flexShrink: 0 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
                スロットにドラッグして装備
              </Typography>
              {storage}
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: "block" }}>
                ※ 装備をスロットにD&D ／ 倉庫に戻すと取り外し
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* ドラッグ中のフローティングプレビュー */}
      <DragOverlay dropAnimation={null}>
        {activeEquip && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              bgcolor: "background.paper",
              border: "1.5px solid",
              borderColor: "primary.main",
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(124,77,255,0.5)",
              fontSize: 13,
              fontWeight: 600,
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 18 }}>{activeEquip.sprite}</span>
            {activeEquip.name}
          </Box>
        )}
      </DragOverlay>
    </DndContext>
  );
}
