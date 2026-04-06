import { useState, type ReactNode } from "react";
import {
  AppBar, Box, Toolbar, IconButton, Chip,
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  BottomNavigation, BottomNavigationAction, useMediaQuery, useTheme,
  Snackbar, Alert, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
  Tabs, Tab, Slider,
} from "@mui/material";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import { useBgm } from "../../contexts/BgmContext";
import ExploreIcon from "@mui/icons-material/Explore";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ConstructionIcon from "@mui/icons-material/Construction";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import SyncIcon from "@mui/icons-material/Sync";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import LockIcon from "@mui/icons-material/Lock";
import { useGame } from "../../store/gameStore";
import type { Scene, SyncStatus } from "../../types/game";

const DRAWER_WIDTH = 220;

const NAV_ITEMS: { label: string; icon: ReactNode; scene: Scene }[] = [
  { label: "モンスター", icon: <PeopleIcon />, scene: "guild" },
  { label: "フィールド", icon: <ExploreIcon />, scene: "field" },
  { label: "アイテム", icon: <InventoryIcon />, scene: "items" },
  { label: "クラフト", icon: <ConstructionIcon />, scene: "craft" },
];

function SyncChip({ status }: { status: SyncStatus }) {
  if (status === "synced") return <Chip icon={<CloudDoneIcon />} label="同期済" color="success" size="small" />;
  if (status === "pending") return <Chip icon={<SyncIcon />} label="同期中..." color="warning" size="small" />;
  return <Chip icon={<CloudOffIcon />} label="オフライン" color="error" size="small" />;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { state, dispatch } = useGame();
  const { player, notification, scene } = state;
  const { volume, muted, setVolume, setMuted } = useBgm();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState(0);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const isBattle = scene === "battle";

  const navigate = (s: Scene) => {
    if (isBattle) return; // バトル中はナビゲーション禁止
    dispatch({ type: "SET_SCENE", payload: s });
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
    setDrawerOpen(false);
  };

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    dispatch({ type: "SET_SCENE", payload: "login" });
  };

  // ── サイドバー共通コンテンツ ──────────────────────────────────────────
  const navContent = (
    <Box sx={{ width: DRAWER_WIDTH, display: "flex", flexDirection: "column", height: "100%", pt: 1 }}>

      {/* 通常ナビ or バトルロック表示 */}
      {isBattle ? (
        <Box sx={{ px: 2.5, py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <LockIcon sx={{ fontSize: 15, color: "error.main" }} />
            <Typography variant="caption" fontWeight={700} color="error.main" sx={{ letterSpacing: 0.5 }}>
              バトル中
            </Typography>
          </Box>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, display: "block", lineHeight: 1.5 }}>
            ナビゲーションはロック中です。バトルを終了してから移動してください。
          </Typography>
          {/* ロックされたメニュー: 薄く表示 */}
          <List dense sx={{ mt: 1.5, opacity: 0.25, pointerEvents: "none" }}>
            {NAV_ITEMS.map((item) => (
              <ListItem key={item.scene} disablePadding>
                <ListItemButton sx={{ borderRadius: 2, mx: -1, py: 0.6 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      ) : (
        <List sx={{ px: 0 }}>
          {NAV_ITEMS.map((item) => (
            <ListItem key={item.scene} disablePadding>
              <ListItemButton
                selected={scene === item.scene}
                onClick={() => navigate(item.scene)}
                sx={{ borderRadius: 2, mx: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      <Box sx={{ flexGrow: 1 }} />

      {/* 設定・ログアウト (常時表示) */}
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      <List sx={{ pb: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => { setSettingsOpen(true); setDrawerOpen(false); }}
            sx={{ borderRadius: 2, mx: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}><SettingsIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="設定" primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{ borderRadius: 2, mx: 1, color: "error.light", "&:hover": { bgcolor: "rgba(244,67,54,0.08)" } }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: "error.light" }}><LogoutIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="ログアウト" primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>

      {/* AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1, bgcolor: "background.paper" }} elevation={0}>
        <Toolbar variant="dense">
          {isMobile && (
            <IconButton edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
            <Chip label={`Lv.${player.level}`} color="primary" size="small" />
            <Chip label={`💰 ${player.gold}G`} color="secondary" size="small" variant="outlined" />
          </Box>
          <SyncChip status={player.syncStatus} />
          {isBattle && (
            <Chip
              icon={<LockIcon sx={{ fontSize: "14px !important" }} />}
              label="バトル中"
              color="error"
              size="small"
              sx={{ ml: "auto", fontWeight: 700, animation: "rainbow-glow 9s linear infinite" }}
            />
          )}
        </Toolbar>
      </AppBar>

      {/* Sidebar (PC) */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              top: 48,
              bgcolor: "background.paper",
              borderRight: "1px solid rgba(255,255,255,0.08)",
            },
          }}
        >
          {navContent}
        </Drawer>
      )}

      {/* Drawer (Mobile) */}
      {isMobile && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { top: "48px" } }}
          ModalProps={{ slotProps: { backdrop: { sx: { top: "48px" } } } }}
        >
          {navContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: "48px",
          mb: isMobile && !isBattle ? "56px" : 0,
          ml: isMobile ? 0 : `${DRAWER_WIDTH}px`,
          overflow: "auto",
        }}
      >
        <Box key={scene} sx={{ animation: "page-enter 0.22s ease-out", height: "100%" }}>
          {children}
        </Box>
      </Box>

      {/* Bottom Nav (Mobile) — 通常時 */}
      {isMobile && !isBattle && (
        <BottomNavigation
          value={NAV_ITEMS.findIndex((n) => n.scene === scene)}
          onChange={(_, v: number) => navigate(NAV_ITEMS[v]!.scene)}
          sx={{
            position: "fixed", bottom: 0, left: 0, right: 0,
            bgcolor: "background.paper",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction key={item.scene} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      )}


      {/* ── 設定ダイアログ ── */}
      <Dialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            border: "1px solid rgba(124,77,255,0.3)",
            borderRadius: 2,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid rgba(124,77,255,0.2)", fontWeight: 700, color: "primary.light", pb: 0 }}>
          ⚙️ 設定
        </DialogTitle>

        {/* タブ */}
        <Tabs
          value={settingsTab}
          onChange={(_, v) => setSettingsTab(v)}
          sx={{ px: 2, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Tab label="サウンド" sx={{ fontSize: 12, minHeight: 40 }} />
          <Tab label="操作方法" sx={{ fontSize: 12, minHeight: 40 }} />
          <Tab label="ゲーム情報" sx={{ fontSize: 12, minHeight: 40 }} />
        </Tabs>

        <DialogContent sx={{ pt: 2 }}>

          {/* ── サウンドタブ ── */}
          {settingsTab === 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* ミュートトグル */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setMuted(!muted)}
                  sx={{ color: muted ? "text.disabled" : "primary.main" }}
                >
                  {muted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                </IconButton>
                <Typography variant="body2" color={muted ? "text.disabled" : "text.primary"}>
                  {muted ? "ミュート中" : "BGM ON"}
                </Typography>
              </Box>

              {/* 音量スライダー */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                  音量: {Math.round(volume * 100)}%
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <VolumeOffIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                  <Slider
                    value={volume}
                    min={0}
                    max={1}
                    step={0.01}
                    disabled={muted}
                    onChange={(_, v) => setVolume(v as number)}
                    sx={{ flex: 1, color: "primary.main" }}
                    size="small"
                  />
                  <VolumeUpIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                </Box>
              </Box>
            </Box>
          )}

          {/* ── 操作方法タブ ── */}
          {settingsTab === 1 && (
            <Box sx={{ p: 0.5, bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.07)" }}>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {[
                  "フィールド移動: WASD / 矢印キー",
                  "モバイル移動: スワイプ or D-pad",
                  "モンスター詳細: カードをクリック",
                  "装備: ドラッグ&ドロップ",
                ].map((text) => (
                  <Typography key={text} component="li" variant="caption" color="text.secondary" sx={{ fontSize: 11, lineHeight: 2.2 }}>
                    {text}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}

          {/* ── ゲーム情報タブ ── */}
          {settingsTab === 2 && (
            <Box sx={{ p: 1, bgcolor: "rgba(255,255,255,0.04)", borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.07)" }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
                Guild Owner RPG — 開発中
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ borderTop: "1px solid rgba(124,77,255,0.2)", px: 3, py: 1.5 }}>
          <Button onClick={() => setSettingsOpen(false)} variant="contained" sx={{ fontWeight: 700 }}>
            閉じる
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── ログアウト確認ダイアログ ── */}
      <Dialog
        open={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            border: "1px solid rgba(244,67,54,0.3)",
            borderRadius: 2,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid rgba(244,67,54,0.2)", fontWeight: 700 }}>
          ログアウト
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            ログアウトしますか？{isBattle && " バトル中のデータは失われます。"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", px: 3, py: 1.5, gap: 1 }}>
          <Button onClick={() => setLogoutConfirmOpen(false)} sx={{ color: "text.secondary" }}>
            キャンセル
          </Button>
          <Button onClick={confirmLogout} variant="contained" color="error" sx={{ fontWeight: 700 }}>
            ログアウト
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast通知 */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => dispatch({ type: "CLEAR_NOTIFY" })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={notification?.severity || "info"} sx={{ width: "100%" }}>
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
