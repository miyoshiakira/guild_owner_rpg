import { useState, useCallback, memo, useRef } from "react";
import {
  DndContext,
  DragOverlay,
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
  Box,
  Grid,
  Typography,
  Chip,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { useGame } from "../store/gameStore";
import type { EquipSlot, Monster } from "../types/game";
import { SpriteImage } from "../components/SpriteImage";
import { DragPreview, MonsterDetail } from "../components/guild/GuildMonsterDetail";
import { TYPE_COLORS } from "../components/guild/guildConstants";
import MonsterCell from "../components/guild/GuildMonsterCell";
import BreedConfirmDialog from "../components/guild/BreedConfirmDialog";
import BreedModeBanner from "../components/guild/BreedModeBanner";

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

// MonsterDetail と装備D&D関連は components/guild/GuildMonsterDetail.tsx に分離

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
                  variant="outlined"
                  onClick={() => dispatch({ type: "SET_SCENE", payload: "debug" })}
                  sx={{ fontSize: 11, py: 0.4, px: 1, minWidth: 0, whiteSpace: "nowrap" }}
                >
                  🔧 デバッグ
                </Button>
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
            <BreedModeBanner breedStep={breedStep} breedBase={breedBase} />

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
      <BreedConfirmDialog
        open={breedConfirmOpen}
        breedBase={breedBase}
        breedPartner={breedPartner}
        onClose={() => { setBreedConfirmOpen(false); setBreedPartner(null); }}
        onConfirm={handleBreedConfirm}
      />
    </DndContext>
  );
}
