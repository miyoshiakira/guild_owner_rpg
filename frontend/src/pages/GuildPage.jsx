import { useState } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Chip, Button,
  Drawer, List, ListItem, ListItemText, Divider, LinearProgress,
  Avatar, Badge, Tooltip,
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import StorefrontIcon from "@mui/icons-material/Storefront";
import HealingIcon from "@mui/icons-material/Healing";
import { useGame } from "../store/gameStore";
import { ITEMS } from "../data/testData";

const TYPE_COLORS = {
  水: "primary", 地: "warning", 光: "secondary", 炎: "error", 闇: "default",
};

function MonsterCard({ monster }) {
  const hpPct = (monster.hp / monster.maxHp) * 100;
  const mpPct = (monster.mp / monster.maxMp) * 100;
  return (
    <Card sx={{ height: "100%", position: "relative" }}>
      {monster.isParty && (
        <Chip label="出撃中" color="success" size="small" sx={{ position: "absolute", top: 8, right: 8 }} />
      )}
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Typography fontSize={32}>{monster.sprite}</Typography>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>{monster.name}</Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Chip label={monster.type} color={TYPE_COLORS[monster.type] || "default"} size="small" />
              <Chip label={`Lv.${monster.level}`} size="small" variant="outlined" />
            </Box>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">HP</Typography>
        <LinearProgress variant="determinate" value={hpPct} color="error" sx={{ height: 6, borderRadius: 3, mb: 0.5 }} />
        <Typography variant="caption" color="text.secondary">MP</Typography>
        <LinearProgress variant="determinate" value={mpPct} color="primary" sx={{ height: 6, borderRadius: 3, mb: 1 }} />
        <Grid container spacing={1}>
          {[["ATK", monster.atk], ["DEF", monster.def], ["SPD", monster.spd]].map(([k, v]) => (
            <Grid item xs={4} key={k}>
              <Box sx={{ textAlign: "center", bgcolor: "rgba(255,255,255,0.05)", borderRadius: 1, p: 0.5 }}>
                <Typography variant="caption" color="text.secondary">{k}</Typography>
                <Typography variant="body2" fontWeight={700}>{v}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          性格: {monster.personality} | スキル: {monster.skills.join(", ")}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function GuildPage() {
  const { state, dispatch } = useGame();
  const { monsters, player } = state;
  const [shopOpen, setShopOpen] = useState(false);

  const handleHeal = () => {
    dispatch({ type: "UPDATE_PLAYER", payload: { hp: player.maxHp, mp: player.maxMp } });
    dispatch({ type: "NOTIFY", payload: { message: "ギルドの泉で全回復した！", severity: "success" } });
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* ギルドハウスヘッダー */}
      <Card sx={{ mb: 2, bgcolor: "rgba(124,77,255,0.1)", border: "1px solid rgba(124,77,255,0.4)" }}>
        <CardContent sx={{ pb: "12px !important" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <Box>
              <Typography variant="h6">🏰 ギルドハウス</Typography>
              <Typography variant="body2" color="text.secondary">
                仲間を編成し、冒険の準備をしよう
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" color="error" startIcon={<HealingIcon />} onClick={handleHeal} size="small">
                全回復（無料）
              </Button>
              <Button variant="outlined" startIcon={<StorefrontIcon />} onClick={() => setShopOpen(true)} size="small">
                ショップ
              </Button>
              <Button variant="contained" startIcon={<ShieldIcon />} onClick={() => dispatch({ type: "SET_SCENE", payload: "field" })} size="small">
                冒険へ出発
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* モンスター一覧 */}
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>
        仲間モンスター（{monsters.length}体 / 10体）
      </Typography>
      <Grid container spacing={2}>
        {monsters.map((m) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={m.id}>
            <MonsterCard monster={m} />
          </Grid>
        ))}
      </Grid>

      {/* ショップ Drawer */}
      <Drawer anchor="right" open={shopOpen} onClose={() => setShopOpen(false)}>
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>🛒 ショップ</Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {ITEMS.map((item) => (
              <ListItem key={item.id} secondaryAction={
                <Button size="small" variant="outlined" onClick={() => {
                  dispatch({ type: "NOTIFY", payload: { message: `${item.name}を購入した！`, severity: "success" } });
                }}>購入</Button>
              }>
                <ListItemText
                  primary={`${item.sprite} ${item.name}`}
                  secondary={`${item.type} | ${item.effect}`}
                />
              </ListItem>
            ))}
          </List>
          <Typography variant="caption" color="text.secondary">
            所持金: {player.gold}G
          </Typography>
        </Box>
      </Drawer>
    </Box>
  );
}
