import React, { memo, useState } from "react";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Modal,
  Backdrop,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { Equipment, EquipSlot, Monster } from "../../types/game";
import { SpriteImage } from "../SpriteImage";
import { SKILL_MAP } from "../../data/masters/skillMaster";
import { PERSONALITY_MAP } from "../../data/masters/personalityMaster";
import { TYPE_GROWTH_MAP } from "../../data/masters/typeGrowthMaster";
import { RACE_MAP } from "../../data/masters/raceMaster";
import type { GrowthCoeff } from "../../data/masters/personalityMaster";
import type { SkillMaster } from "../../types/masters";
import { RACE_BY_NAME, SLOT_META, SLOT_ORDER, TYPE_COLORS, TYPE_EMOJI } from "./guildConstants";

export const DragPreview = memo(function DragPreview() {
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
      willChange: "transform",
    }}>
      <span style={{ fontSize: 18 }}>{eq.sprite}</span>
      {eq.name}
    </Box>
  );
});

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
        border: `1.5px dashed ${borderColor}`,
        bgcolor: bg,
        minHeight: 40,
        transition: "border-color 0.1s, background-color 0.1s",
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

type StatRow = {
  icon: string;
  label: string;
  baseKey: keyof Monster;
  currentKey?: keyof Monster;
  bonusKey?: "atkBonus" | "defBonus" | "spdBonus";
};
const STAT_ROWS: StatRow[] = [
  { icon: "❤️", label: "HP", baseKey: "maxHp", currentKey: "hp" },
  { icon: "💙", label: "MP", baseKey: "maxMp", currentKey: "mp" },
  { icon: "⚔️", label: "ATK", baseKey: "atk", bonusKey: "atkBonus" },
  { icon: "🛡️", label: "DEF", baseKey: "def", bonusKey: "defBonus" },
  { icon: "💨", label: "SPD", baseKey: "spd", bonusKey: "spdBonus" },
];

interface MonsterDetailProps {
  monster: Monster;
  allEquipment: Equipment[];
  storageItems: Equipment[];
  onBack: () => void;
  onToggleParty: (isParty: boolean) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  isLastMember: boolean;
}

export const MonsterDetail = memo(function MonsterDetail({
  monster,
  allEquipment,
  storageItems,
  onBack,
  onToggleParty,
  onRename,
  onDelete,
  isLastMember,
}: MonsterDetailProps) {
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
    SLOT_ORDER.reduce((sum, slot) => sum + (getEquipped(slot)?.[key] ?? 0), 0);

  const expPct = Math.min(100, Math.round((monster.exp / monster.expNext) * 100));

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.75 }}>
            <IconButton size="small" onClick={onBack}><ArrowBackIcon fontSize="small" /></IconButton>
            <Typography variant="h6" fontWeight={700} noWrap sx={{ flex: 1, minWidth: 0 }}>{monster.name}</Typography>
            <Tooltip title="名前を変更" placement="top" arrow>
              <IconButton size="small" onClick={() => { setRenameValue(monster.name); setRenameOpen(true); }} sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}>
                <EditIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title={isLastMember ? "最後の一人は削除できません" : "メンバーを削除"} placement="top" arrow>
              <span>
                <IconButton size="small" disabled={isLastMember} onClick={() => setDeleteConfirmOpen(true)} sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}>
                  <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", pl: 0.5 }}>
            <Chip label={`${TYPE_EMOJI[monster.type] ?? ""} ${monster.type}`} size="small" onClick={openTypeGrowth} sx={{ bgcolor: TYPE_COLORS[monster.type], color: "#fff", height: 20, fontSize: 11, cursor: "pointer" }} />
            <Chip label={`Lv.${monster.level}`} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
            <Chip label={monster.isParty ? "⚔ 出撃中" : "💤 待機中"} color={monster.isParty ? "success" : "default"} size="small" onClick={() => onToggleParty(!monster.isParty)} sx={{ height: 20, fontSize: 11, cursor: "pointer" }} />
          </Box>
        </Box>

        <Box onClick={() => setPortraitOpen(true)} sx={{
          width: 88, height: 88, flexShrink: 0, ml: 1.5,
          borderRadius: 2, bgcolor: "rgba(255,255,255,0.04)",
          border: `2px solid ${TYPE_COLORS[monster.type] ?? "rgba(255,255,255,0.15)"}`,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          transition: "box-shadow 0.15s", "&:hover": { boxShadow: `0 0 12px ${TYPE_COLORS[monster.type] ?? "rgba(124,77,255,0.6)"}` },
          "&:active": { opacity: 0.8 },
        }}>
          <SpriteImage sprite={monster.sprite} size={72} alt={monster.name} />
        </Box>
      </Box>

      <Card sx={{ mb: 1.25 }}>
        <CardContent sx={{ py: "10px !important", px: "12px !important" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1, fontSize: 10, mb: 0.75, display: "block" }}>STATS</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 0 }}>
            {STAT_ROWS.map(({ icon, label, baseKey, currentKey, bonusKey }) => {
              const base = monster[baseKey] as number;
              const statBonus = bonusKey ? bonus(bonusKey) : 0;
              const current = currentKey != null ? (monster[currentKey] as number) : null;
              return (
                <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.75, py: 0.45 }}>
                  <Typography sx={{ fontSize: 15, lineHeight: 1, width: 20, textAlign: "center", flexShrink: 0 }}>{icon}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ width: 30, fontSize: 11, flexShrink: 0 }}>{label}</Typography>
                  {current != null ? (
                    <Typography variant="body2" fontWeight={700} sx={{ minWidth: 24, fontSize: 12 }}>
                      <Box component="span" sx={{ color: current < base * 0.3 ? "error.main" : current < base * 0.7 ? "warning.main" : "inherit" }}>{current}</Box>
                      <Box component="span" sx={{ color: "text.disabled", fontSize: 10 }}>/ {base}</Box>
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="body2" fontWeight={700} sx={{ minWidth: 24 }}>{base + statBonus}</Typography>
                      {statBonus > 0 && <Typography variant="caption" color="success.main" sx={{ fontSize: 10 }}>+{statBonus}</Typography>}
                    </>
                  )}
                </Box>
              );
            })}
          </Box>

          <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.4 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>⭐ EXP</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{monster.exp} / {monster.expNext}（{expPct}%）</Typography>
            </Box>
            <LinearProgress variant="determinate" value={expPct} sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(255,255,255,0.08)", "& .MuiLinearProgress-bar": { bgcolor: "secondary.main", borderRadius: 3 } }} />
          </Box>

          {(monster.breedCount ?? 0) > 0 && (
            <Box sx={{ mt: 0.75 }}>
              <Chip label={`⚗ 配合 ${monster.breedCount}回`} size="small" variant="outlined" sx={{ height: 20, fontSize: 10, borderColor: "rgba(255,193,7,0.6)", color: "#ffc107" }} />
            </Box>
          )}

          <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            <Chip label={`😊 ${monster.personality}`} size="small" variant="outlined" onClick={openPersonalityGrowth} sx={{ height: 20, fontSize: 10, cursor: "pointer", "&:hover": { borderColor: "primary.main", color: "primary.light" } }} />
            {(() => {
              const raceName = monster.race ?? RACE_BY_NAME[monster.name];
              return raceName ? (
                <Chip label={`🧬 ${raceName}`} size="small" variant="outlined" onClick={openRaceGrowth} sx={{ height: 20, fontSize: 10, cursor: "pointer", "&:hover": { borderColor: "secondary.main", color: "secondary.light" } }} />
              ) : null;
            })()}
            {monster.skills.map((skill) => (
              <Chip key={skill} label={skill} size="small" onClick={() => setSkillDetail(SKILL_MAP[skill] ?? { id: "", name: skill, power: 0, description: "詳細不明", mpCost: 0 })} sx={{ height: 20, fontSize: 10, bgcolor: "rgba(124,77,255,0.15)", border: "1px solid rgba(124,77,255,0.3)", cursor: "pointer" }} />
            ))}
          </Box>

          <Dialog open={growthModal !== null} onClose={() => setGrowthModal(null)} PaperProps={{ sx: { bgcolor: "background.paper", borderRadius: 2, minWidth: 270, maxWidth: 320 } }}>
            {growthModal && (
              <>
                <DialogTitle sx={{ pb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "rgba(124,77,255,0.15)", border: "1px solid rgba(124,77,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{growthModal.emoji}</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{growthModal.title}</Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: "4px !important" }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>{growthModal.description}</Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
                    {([
                      { key: "hp", label: "HP", icon: "❤️" },
                      { key: "mp", label: "MP", icon: "💙" },
                      { key: "atk", label: "ATK", icon: "⚔️" },
                      { key: "def", label: "DEF", icon: "🛡️" },
                      { key: "spd", label: "SPD", icon: "💨" },
                    ] as { key: keyof GrowthCoeff; label: string; icon: string }[]).map(({ key, label, icon }) => {
                      const val = growthModal.growth[key];
                      const pct = Math.round((val - 1) * 100);
                      const isUp = val > 1.0;
                      const isDn = val < 1.0;
                      const barColor = isUp ? "#4caf50" : isDn ? "#f44336" : "rgba(255,255,255,0.25)";
                      const barWidth = isUp ? Math.min(100, (val - 1) * 200) : isDn ? Math.min(100, (1 - val) * 200) : 0;
                      return (
                        <Box key={key} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography sx={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{icon}</Typography>
                          <Typography variant="caption" sx={{ width: 28, fontWeight: 600, flexShrink: 0 }}>{label}</Typography>
                          <Box sx={{ flex: 1, height: 6, bgcolor: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                            <Box sx={{ height: "100%", borderRadius: 3, bgcolor: barColor, width: `${barWidth}%`, float: isDn ? "right" : "left" }} />
                          </Box>
                          <Typography variant="caption" sx={{ width: 46, textAlign: "right", fontWeight: 700, flexShrink: 0, color: isUp ? "success.light" : isDn ? "error.light" : "text.secondary", fontSize: 12 }}>
                            {val.toFixed(1)}×{pct !== 0 && <Box component="span" sx={{ fontSize: 9, ml: 0.3 }}>({pct > 0 ? "+" : ""}{pct}%)</Box>}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </DialogContent>
                <DialogActions sx={{ pt: 0 }}><Button size="small" onClick={() => setGrowthModal(null)}>閉じる</Button></DialogActions>
              </>
            )}
          </Dialog>

          <Dialog open={skillDetail !== null} onClose={() => setSkillDetail(null)} PaperProps={{ sx: { bgcolor: "background.paper", borderRadius: 2, minWidth: 260, maxWidth: 340 } }}>
            {skillDetail && (
              <>
                <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: "50%", bgcolor: "rgba(124,77,255,0.2)", border: "1px solid rgba(124,77,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚡</Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{skillDetail.name}</Typography>
                </DialogTitle>
                <DialogContent sx={{ pt: "0 !important" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{skillDetail.description}</Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Box sx={{ flex: 1, textAlign: "center", py: 1, borderRadius: 1, bgcolor: skillDetail.power > 0 ? "rgba(244,67,54,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${skillDetail.power > 0 ? "rgba(244,67,54,0.3)" : "rgba(255,255,255,0.1)"}` }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: 10 }}>威力</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: skillDetail.power > 0 ? "error.light" : "text.disabled" }}>{skillDetail.power > 0 ? skillDetail.power : "—"}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, textAlign: "center", py: 1, borderRadius: 1, bgcolor: skillDetail.mpCost > 0 ? "rgba(33,150,243,0.12)" : "rgba(255,255,255,0.05)", border: `1px solid ${skillDetail.mpCost > 0 ? "rgba(33,150,243,0.3)" : "rgba(255,255,255,0.1)"}` }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: 10 }}>消費MP</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: skillDetail.mpCost > 0 ? "info.light" : "text.disabled" }}>{skillDetail.mpCost > 0 ? skillDetail.mpCost : "—"}</Typography>
                    </Box>
                  </Box>
                </DialogContent>
                <DialogActions sx={{ pt: 0 }}><Button size="small" onClick={() => setSkillDetail(null)}>閉じる</Button></DialogActions>
              </>
            )}
          </Dialog>
        </CardContent>
      </Card>

      <Card sx={{ mb: 1.25 }}>
        <CardContent sx={{ py: "10px !important", px: "12px !important" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1, fontSize: 10, mb: 0.75, display: "block" }}>EQUIPMENT</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {SLOT_ORDER.map((slot) => (
              <DroppableSlot key={slot} id={`${monster.id}:${slot}`} slot={slot} equippedItem={getEquipped(slot)} />
            ))}
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ py: "10px !important", px: "12px !important" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 1, fontSize: 10, mb: 0.5, display: "block" }}>STORAGE</Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, display: "block", mb: 0.75 }}>
            スロットへドラッグして装備 / 倉庫へ戻すと取り外し
          </Typography>
          <StoragePanel items={storageItems} />
        </CardContent>
      </Card>

      <Modal open={portraitOpen} onClose={() => setPortraitOpen(false)} slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 300 } }}>
        <Fade in={portraitOpen} timeout={300}>
          <Box onClick={() => setPortraitOpen(false)} sx={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
            <Box onClick={(e: React.MouseEvent) => e.stopPropagation()} sx={{ width: { xs: "72vw", sm: 320 }, height: { xs: "72vw", sm: 320 }, maxWidth: 320, maxHeight: 320, borderRadius: 3, bgcolor: "rgba(20,20,40,0.95)", border: `3px solid ${TYPE_COLORS[monster.type] ?? "rgba(124,77,255,0.8)"}`, boxShadow: `0 0 40px ${TYPE_COLORS[monster.type] ?? "rgba(124,77,255,0.4)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <SpriteImage sprite={monster.sprite} size={Math.min(280, typeof window !== "undefined" ? window.innerWidth * 0.64 : 280)} alt={monster.name} />
            </Box>
            <Box sx={{ textAlign: "center" }} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <Typography variant="h6" fontWeight={700} sx={{ color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{monster.name}</Typography>
              <Chip label={`${monster.type}  Lv.${monster.level}`} size="small" sx={{ bgcolor: TYPE_COLORS[monster.type], color: "#fff", mt: 0.5 }} />
            </Box>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>タップして閉じる</Typography>
          </Box>
        </Fade>
      </Modal>

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} fullWidth maxWidth="xs">
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
          <Button size="small" onClick={() => setRenameOpen(false)}>キャンセル</Button>
          <Button size="small" variant="contained" disabled={!renameValue.trim() || renameValue.trim() === monster.name} onClick={() => { onRename(renameValue.trim()); setRenameOpen(false); }}>
            変更する
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: 2, minWidth: 300, border: "1px solid rgba(244,67,54,0.4)" } }}>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>🗑️ メンバーを削除しますか？</DialogTitle>
        <DialogContent sx={{ pt: "0 !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <SpriteImage sprite={monster.sprite} size={32} alt={monster.name} />
            <Typography variant="body1" fontWeight={700}>{monster.name}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">ギルドから追放されます。装備品は倉庫に戻ります。</Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>この操作は取り消せません。</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: "text.secondary" }}>キャンセル</Button>
          <Button variant="contained" color="error" onClick={() => { setDeleteConfirmOpen(false); onDelete(); }}>削除する</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});
