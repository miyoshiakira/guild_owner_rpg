import { useState, type ReactNode } from "react";
import {
  AppBar, Box, Toolbar, Typography, IconButton, Chip,
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  BottomNavigation, BottomNavigationAction, useMediaQuery, useTheme,
  LinearProgress, Snackbar, Alert,
} from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import PeopleIcon from "@mui/icons-material/People";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import SyncIcon from "@mui/icons-material/Sync";
import MenuIcon from "@mui/icons-material/Menu";
import { useGame } from "../../store/gameStore";
import type { Scene, SyncStatus } from "../../types/game";

const DRAWER_WIDTH = 220;

const NAV_ITEMS: { label: string; icon: ReactNode; scene: Scene }[] = [
  { label: "モンスター管理", icon: <PeopleIcon />, scene: "guild" },
  { label: "フィールド", icon: <ExploreIcon />, scene: "field" },
];

function SyncChip({ status }: { status: SyncStatus }) {
  if (status === "synced") return <Chip icon={<CloudDoneIcon />} label="同期済" color="success" size="small" />;
  if (status === "pending") return <Chip icon={<SyncIcon />} label="同期中..." color="warning" size="small" />;
  return <Chip icon={<CloudOffIcon />} label="オフライン" color="error" size="small" />;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { state, dispatch } = useGame();
  const { player, notification, scene } = state;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = (s: Scene) => {
    dispatch({ type: "SET_SCENE", payload: s });
    setDrawerOpen(false);
  };

  const hpPct = (player.hp / player.maxHp) * 100;
  const expPct = (player.exp / player.expNext) * 100;

  const navContent = (
    <Box sx={{ width: DRAWER_WIDTH, pt: 2 }}>
      <Box sx={{ px: 2, pb: 2 }}>
        <Typography variant="caption" color="text.secondary">HP</Typography>
        <LinearProgress variant="determinate" value={hpPct} color="error" sx={{ mb: 0.5, height: 8, borderRadius: 4 }} />
        <Typography variant="caption" color="text.secondary">EXP</Typography>
        <LinearProgress variant="determinate" value={expPct} color="secondary" sx={{ height: 6, borderRadius: 4 }} />
      </Box>
      <List>
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
        </Toolbar>
      </AppBar>

      {/* Sidebar (PC) */}
      {!isMobile && (
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, "& .MuiDrawer-paper": { width: DRAWER_WIDTH, top: 48, bgcolor: "background.paper", borderRight: "1px solid rgba(255,255,255,0.08)" } }}>
          {navContent}
        </Drawer>
      )}

      {/* Drawer (Mobile) */}
      {isMobile && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {navContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, mt: "48px", mb: isMobile ? "56px" : 0, ml: isMobile ? 0 : `${DRAWER_WIDTH}px`, overflow: "auto" }}>
        {children}
      </Box>

      {/* Bottom Nav (Mobile) */}
      {isMobile && (
        <BottomNavigation
          value={NAV_ITEMS.findIndex((n) => n.scene === scene)}
          onChange={(_, v: number) => navigate(NAV_ITEMS[v]!.scene)}
          sx={{ position: "fixed", bottom: 0, left: 0, right: 0, bgcolor: "background.paper", borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          {NAV_ITEMS.map((item) => (
            <BottomNavigationAction key={item.scene} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      )}

      {/* Toast通知 */}
      <Snackbar
        open={!!notification}
        autoHideDuration={3000}
        onClose={() => dispatch({ type: "CLEAR_NOTIFY" })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {notification && (
          <Alert severity={notification.severity} sx={{ width: "100%" }}>
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
}
