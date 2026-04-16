import { useState, type ReactNode } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { darkTheme } from "./theme/theme";
import { GameProvider, useGame } from "./store/gameStore";
import { BgmProvider } from "./contexts/BgmContext";
import AppLayout from "./components/layout/AppLayout";
import BgmDownloadScreen from "./components/BgmDownloadScreen";
import LoginPage from "./pages/LoginPage";
import GuildPage from "./pages/GuildPage";
import FieldPage from "./pages/FieldPage";
import BattlePage from "./pages/BattlePage";
import ItemsPage from "./pages/ItemsPage";
import CraftPage from "./pages/CraftPage";
import DebugPage from "./pages/DebugPage";
import MapEditorPage from "./pages/MapEditorPage";

/** BGM キャッシュが完了するまでダウンロード画面を表示する */
function BgmGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  if (!ready) return <BgmDownloadScreen onComplete={() => setReady(true)} />;
  return <>{children}</>;
}

function GameRouter() {
  const { state } = useGame();
  const { scene } = state;

  if (scene === "login") return <LoginPage />;
  if (scene === "mapeditor") return <MapEditorPage />;
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
      {scene === "debug" && <DebugPage />}
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BgmProvider>
        <GameProvider>
          <BgmGate>
            <GameRouter />
          </BgmGate>
        </GameProvider>
      </BgmProvider>
    </ThemeProvider>
  );
}
