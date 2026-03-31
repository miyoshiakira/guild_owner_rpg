import { Box, Button, Card, CardContent, Typography, Divider } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useGame } from "../store/gameStore";

export default function LoginPage() {
  const { dispatch } = useGame();

  const handleLogin = () => {
    // テスト環境: Firebase認証なしでスキップ
    dispatch({ type: "SET_SCENE", payload: "guild" });
    dispatch({ type: "NOTIFY", payload: { message: "ようこそ、ギルドマスター！", severity: "success" } });
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            ギルドを築き、モンスターを仲間に、冒険へ出よう。
          </Typography>
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
          <Button variant="outlined" onClick={handleLogin} fullWidth>
            テストプレイ（ログインなし）
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
            ※ テスト環境のため認証はスキップされます
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
