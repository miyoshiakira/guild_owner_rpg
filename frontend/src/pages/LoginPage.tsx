import { useEffect, useState } from "react";
import {
  Box, Button, Card, CardContent, Typography, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, IconButton, Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import GoogleIcon from "@mui/icons-material/Google";
import { useGame } from "../store/gameStore";
import { loadGameData, deleteSaveData, getSlotSummaries, type SlotSummary } from "../db/saveService";

/** ISO 文字列を「YYYY/MM/DD HH:mm」形式に変換 */
function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function LoginPage() {
  const { dispatch } = useGame();
  const [slots, setSlots] = useState<SlotSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<SlotSummary | null>(null);

  const refreshSlots = async () => {
    setLoading(true);
    try {
      setSlots(await getSlotSummaries());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshSlots(); }, []);

  const handleSelectSlot = async (slot: SlotSummary) => {
    if (slot.exists) {
      // 既存スロットをロード
      const saved = await loadGameData(slot.slotId);
      dispatch({
        type: "LOAD_SAVE",
        payload: {
          activeSlot: slot.slotId,
          ...(saved.player        ? { player:        saved.player }        : {}),
          ...(saved.monsters      ? { monsters:      saved.monsters }      : {}),
          ...(saved.equipment     ? { equipment:     saved.equipment }     : {}),
          ...(saved.items         ? { items:         saved.items }         : {}),
          ...(saved.materials     ? { materials:     saved.materials }     : {}),
          ...(saved.visitedMapIds ? { visitedMapIds: saved.visitedMapIds } : {}),
          ...(saved.isAutoBattle !== undefined ? { isAutoBattle: saved.isAutoBattle } : {}),
          ...(saved.storyFlags    ? { storyFlags:    saved.storyFlags }    : {}),
          ...(saved.storyProgress ? { storyProgress: saved.storyProgress } : {}),
        },
      });
      dispatch({ type: "NOTIFY", payload: { message: `スロット${slot.slotId} をロードしました`, severity: "info" } });
    } else {
      // 空きスロット → 新規ゲーム
      dispatch({ type: "RESET_GAME" });
      dispatch({ type: "SET_SLOT", payload: slot.slotId });
      dispatch({ type: "NOTIFY", payload: { message: `スロット${slot.slotId} で新しいゲームを開始します`, severity: "success" } });
    }
    dispatch({ type: "SET_SCENE", payload: "guild" });
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteTarget) return;
    await deleteSaveData(deleteTarget.slotId);
    setDeleteTarget(null);
    await refreshSlots();
    dispatch({ type: "NOTIFY", payload: { message: `スロット${deleteTarget.slotId} のデータを消去しました`, severity: "warning" } });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        backgroundImage: "radial-gradient(ellipse at center, #1a1a3e 0%, #0d0d1a 70%)",
        p: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 420 }}>
        {/* タイトルカード */}
        <Card sx={{ textAlign: "center", mb: 2 }}>
          <CardContent sx={{ pb: "16px !important" }}>
            <Typography variant="h4" sx={{ mb: 0.5, color: "primary.main" }}>⚔</Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Guild Owner RPG</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              ギルドを築き、モンスターを仲間に、冒険へ出よう。
            </Typography>
          </CardContent>
        </Card>

        {/* スロット選択 */}
        <Card>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <GoogleIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                ※ テスト環境のため認証はスキップされます
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary">セーブデータを選択</Typography>
            </Divider>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={32} />
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                {slots.map((slot) => (
                  <Box
                    key={slot.slotId}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      border: "1px solid",
                      borderColor: slot.exists ? "primary.dark" : "divider",
                      borderRadius: 2,
                      p: 1.25,
                      cursor: "pointer",
                      transition: "border-color 0.15s, background 0.15s",
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: "rgba(124,77,255,0.06)",
                      },
                    }}
                    onClick={() => handleSelectSlot(slot)}
                  >
                    {/* スロット番号バッジ */}
                    <Box
                      sx={{
                        width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        bgcolor: slot.exists ? "primary.dark" : "rgba(255,255,255,0.06)",
                        fontWeight: 700, fontSize: 16,
                      }}
                    >
                      {slot.slotId}
                    </Box>

                    {/* スロット情報 */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {slot.exists ? (
                        <>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                            <Typography variant="body2" fontWeight={700} noWrap>
                              {slot.playerName ?? "ギルドマスター"}
                            </Typography>
                            {slot.playerLevel !== undefined && (
                              <Chip label={`Lv.${slot.playerLevel}`} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                            )}
                            {slot.gold !== undefined && (
                              <Chip label={`💰 ${slot.gold.toLocaleString()}G`} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                            )}
                          </Box>
                          {slot.savedAt && (
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(slot.savedAt)}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          ── 空きスロット（新規ゲーム）
                        </Typography>
                      )}
                    </Box>

                    {/* 削除ボタン（既存スロットのみ） */}
                    {slot.exists && (
                      <Tooltip title="データを消去" placement="left" arrow>
                        <span>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(slot); }}
                            sx={{ opacity: 0.6, "&:hover": { opacity: 1 } }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* セーブデータ消去 確認ダイアログ */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 300, border: "1px solid rgba(244,67,54,0.4)" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          🗑️ データを消去しますか？
        </DialogTitle>
        <DialogContent sx={{ pt: "0 !important" }}>
          <Typography variant="body2" color="text.secondary">
            スロット {deleteTarget?.slotId}「{deleteTarget?.playerName ?? "ギルドマスター"}」の
            セーブデータが
            <Box component="span" sx={{ color: "error.main", fontWeight: 700 }}>すべて削除</Box>
            されます。この操作は取り消せません。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ color: "text.secondary" }}>
            キャンセル
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirmed}>
            消去する
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
