import { useEffect, useState } from "react";
import {
  Box, Button, Card, CardContent, Typography, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useGame } from "../store/gameStore";
import { hasSaveData, loadGameData, deleteSaveData } from "../db/saveService";

export default function LoginPage() {
  const { dispatch } = useGame();
  const [saveExists, setSaveExists] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    hasSaveData().then(setSaveExists);
  }, []);

  const handleLogin = async () => {
    if (saveExists) {
      const saved = await loadGameData();
      dispatch({ type: "LOAD_SAVE", payload: saved });
      dispatch({ type: "NOTIFY", payload: { message: "セーブデータをロードしました", severity: "info" } });
    } else {
      dispatch({ type: "NOTIFY", payload: { message: "ようこそ、ギルドマスター！", severity: "success" } });
    }
    dispatch({ type: "SET_SCENE", payload: "guild" });
  };

  const handleDeleteConfirmed = async () => {
    setDeleteConfirmOpen(false);
    await deleteSaveData();
    dispatch({ type: "RESET_GAME" }); // メモリ上の state も初期化（再ログイン時の再書き込み防止）
    setSaveExists(false);
    dispatch({ type: "NOTIFY", payload: { message: "セーブデータを消去しました", severity: "warning" } });
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
      }}
    >
      <Card sx={{ width: 360, textAlign: "center" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ mb: 1, color: "primary.main" }}>⚔</Typography>
          <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 700 }}>Guild Owner RPG</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            ギルドを築き、モンスターを仲間に、冒険へ出よう。
          </Typography>

          {saveExists && (
            <Chip
              label="💾 セーブデータあり"
              color="success"
              size="small"
              variant="outlined"
              sx={{ mb: 2 }}
            />
          )}

          <Divider sx={{ mb: 3 }} />

          <Button
            variant="contained"
            startIcon={<GoogleIcon />}
            onClick={handleLogin}
            fullWidth
            size="large"
            sx={{ mb: 2 }}
          >
            Googleでログイン
          </Button>
          <Button variant="outlined" onClick={handleLogin} fullWidth sx={{ mb: saveExists ? 2 : 0 }}>
            テストプレイ（ログインなし）
          </Button>

          {saveExists && (
            <Button
              variant="text"
              color="error"
              size="small"
              fullWidth
              onClick={() => setDeleteConfirmOpen(true)}
            >
              セーブデータを消去
            </Button>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            ※ テスト環境のため認証はスキップされます
          </Typography>
        </CardContent>
      </Card>

      {/* セーブデータ消去 確認ダイアログ */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 300, border: "1px solid rgba(244,67,54,0.4)" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          🗑️ セーブデータを消去しますか？
        </DialogTitle>
        <DialogContent sx={{ pt: "0 !important" }}>
          <Typography variant="body2" color="text.secondary">
            この操作は取り消せません。ギルドメンバー・装備品・進行状況が
            <Box component="span" sx={{ color: "error.main", fontWeight: 700 }}>すべて削除</Box>
            されます。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: "text.secondary" }}>
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
