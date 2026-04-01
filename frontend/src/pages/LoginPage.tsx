import { useEffect, useState } from "react";
import {
  Box, Button, Card, CardContent, Typography, Divider, Chip,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useGame } from "../store/gameStore";
import { hasSaveData, loadGameData, deleteSaveData } from "../db/saveService";

export default function LoginPage() {
  const { dispatch } = useGame();
  const [saveExists, setSaveExists] = useState(false);

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

  const handleDeleteSave = async () => {
    await deleteSaveData();
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
              onClick={handleDeleteSave}
            >
              セーブデータを消去
            </Button>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            ※ テスト環境のため認証はスキップされます
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
