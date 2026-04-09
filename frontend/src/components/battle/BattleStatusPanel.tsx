import { Box, Card, CardContent, LinearProgress, Typography } from "@mui/material";
import type { LinearProgressProps } from "@mui/material";
import type { Monster, Enemy } from "../../types/game";
import { SpriteImage } from "../SpriteImage";
import type { BattlePhase } from "./battleTypes";

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color: LinearProgressProps["color"];
}

function StatBar({ label, value, max, color }: StatBarProps) {
  return (
    <Box sx={{ mb: 0.4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", lineHeight: 1 }}>
        <Typography sx={{ fontSize: 10 }} color="text.secondary">{label}</Typography>
        <Typography sx={{ fontSize: 10 }}>{value}/{max}</Typography>
      </Box>
      <LinearProgress variant="determinate" value={(value / max) * 100} color={color} sx={{ height: 5, borderRadius: 3 }} />
    </Box>
  );
}

interface BattleStatusPanelProps {
  enemies: Enemy[];
  allies: Monster[];
  aliveEnemyIdxs: number[];
  activeAllyIdx: number;
  phase: BattlePhase;
}

export function BattleStatusPanel({ enemies, allies, aliveEnemyIdxs, activeAllyIdx, phase }: BattleStatusPanelProps) {
  const activeAlly = allies[activeAllyIdx];

  return (
    <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="caption" color="error.main" textAlign="center" display="block" sx={{ flexShrink: 0, mb: 0.75 }}>
          敵 {aliveEnemyIdxs.length}/{enemies.length}
        </Typography>
        <Box className="battle-cards-wrap" sx={{ height: 282, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.75 }}>
          {enemies.map((enemy, i) => {
            const scoutPct = activeAlly
              ? Math.round(Math.min(0.9, enemy.catchRate * (activeAlly.atk / (activeAlly.atk + enemy.def)) * 2) * 100)
              : Math.round(enemy.catchRate * 100);
            return (
              <Card key={`${enemy.id}-${i}`} style={{ ["--card-delay" as string]: `${i * 70}ms` }} sx={{
                bgcolor: enemy.hp <= 0 ? "rgba(80,80,80,0.1)" : "rgba(244,67,54,0.1)",
                border: `1px solid ${enemy.hp <= 0 ? "rgba(80,80,80,0.2)" : "rgba(244,67,54,0.4)"}`,
                opacity: enemy.hp <= 0 ? 0.35 : 1,
                transition: "opacity 0.4s, border-color 0.3s",
                flexShrink: 0,
                animation: "slide-in-left 0.28s ease-out var(--card-delay, 0ms) both",
              }}>
                <CardContent sx={{ p: "6px 8px !important" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                    <SpriteImage sprite={enemy.sprite} size={36} alt={enemy.name} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }} noWrap>
                          {enemy.name}
                        </Typography>
                        <Typography sx={{ fontSize: 9, color: "secondary.light", fontWeight: 600, flexShrink: 0 }}>
                          🥚{scoutPct}%
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 10 }} color="text.secondary">Lv.{enemy.level}</Typography>
                    </Box>
                  </Box>
                  <StatBar label="HP" value={enemy.hp} max={enemy.maxHp} color="error" />
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="caption" color="success.main" textAlign="center" display="block" sx={{ flexShrink: 0, mb: 0.75 }}>
          味方 {allies.filter((a) => a.hp > 0).length}/{allies.length}
        </Typography>
        <Box className="battle-cards-wrap" sx={{ height: 282, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.75 }}>
          {allies.map((ally, i) => {
            const isActive = i === activeAllyIdx && phase !== "end" && ally.hp > 0;
            return (
              <Card key={ally.id} style={{ ["--card-delay" as string]: `${i * 70}ms` }} sx={{
                bgcolor: ally.hp <= 0 ? "rgba(80,80,80,0.1)" : "rgba(76,175,80,0.1)",
                border: `1px solid ${isActive ? "#4caf50" : ally.hp <= 0 ? "rgba(80,80,80,0.2)" : "rgba(76,175,80,0.3)"}`,
                opacity: ally.hp <= 0 ? 0.35 : 1,
                transition: "opacity 0.4s, border-color 0.3s",
                flexShrink: 0,
                animation: isActive
                  ? "active-ally-pulse 1.6s ease-in-out infinite"
                  : "slide-in-right 0.28s ease-out var(--card-delay, 0ms) both",
              }}>
                <CardContent sx={{ p: "6px 8px !important" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                    <SpriteImage sprite={ally.sprite} size={36} alt={ally.name} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }} noWrap>
                        {ally.name}
                      </Typography>
                      <Typography sx={{ fontSize: 10 }} color="text.secondary">Lv.{ally.level}</Typography>
                    </Box>
                  </Box>
                  <StatBar label="HP" value={ally.hp} max={ally.maxHp} color="success" />
                  <StatBar label="MP" value={ally.mp} max={ally.maxMp} color="primary" />
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
