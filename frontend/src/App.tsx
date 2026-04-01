import { ThemeProvider, CssBaseline } from "@mui/material";
import { darkTheme } from "./theme/theme";
import { GameProvider, useGame } from "./store/gameStore";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import GuildPage from "./pages/GuildPage";
import FieldPage from "./pages/FieldPage";
import BattlePage from "./pages/BattlePage";
import ItemsPage from "./pages/ItemsPage";
import CraftPage from "./pages/CraftPage";

function GameRouter() {
  const { state } = useGame();
  const { scene } = state;

  if (scene === "login") return <LoginPage />;
  if (scene === "battle") return (
    <AppLayout>
      <BattlePage />
    </AppLayout>
  );

  return (
    <AppLayout>
      {scene === "guild" && <GuildPage />}
      {scene === "field" && <FieldPage />}
      {scene === "items" && <ItemsPage />}
      {scene === "craft" && <CraftPage />}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <GameProvider>
        <GameRouter />
      </GameProvider>
    </ThemeProvider>
  );
}
