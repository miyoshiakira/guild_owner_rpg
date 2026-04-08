import { Box, Button, Typography } from "@mui/material";
import type { Monster, Enemy } from "../../types/game";
import { SKILL_MAP } from "../../data/masters/skillMaster";
import type { BattlePhase, Command } from "./battleTypes";

const COMMANDS: { cmd: Command; label: string; color: "error" | "primary" | "secondary" | "inherit" }[] = [
  { cmd: "attack", label: "⚔ こうげき", color: "error" },
  { cmd: "skill", label: "✨ スキル", color: "primary" },
  { cmd: "catch", label: "🥚 捕獲", color: "secondary" },
  { cmd: "run", label: "💨 逃げる", color: "inherit" },
];

interface BattleActionPanelProps {
  phase: BattlePhase;
  allies: Monster[];
  enemies: Enemy[];
  activeAllyIdx: number;
  aliveEnemyIdxs: number[];
  pendingCmd: Command | null;
  pendingSkillName: string | null;
  isAutoMode: boolean;
  onToggleAuto: () => void;
  onCommand: (cmd: Command) => void;
  onSkillSelect: (skillName: string) => void;
  onTargetSelect: (enemyIdx: number) => void;
  onAllyTargetSelect: (allyIdx: number) => void;
  onBackFromSkill: () => void;
  onBackFromTarget: () => void;
  onBackFromAllyTarget: () => void;
}

export function BattleActionPanel({
  phase,
  allies,
  enemies,
  activeAllyIdx,
  aliveEnemyIdxs,
  pendingCmd,
  pendingSkillName,
  isAutoMode,
  onToggleAuto,
  onCommand,
  onSkillSelect,
  onTargetSelect,
  onAllyTargetSelect,
  onBackFromSkill,
  onBackFromTarget,
  onBackFromAllyTarget,
}: BattleActionPanelProps) {
  const activeAlly = allies[activeAllyIdx];

  return (
    <Box sx={{ flexShrink: 0 }}>
      {phase === "skill_select" && (() => {
        const ally = allies[activeAllyIdx]!;
        return (
          <>
            <Typography variant="caption" color="primary.main" sx={{ mb: 0.5, display: "block" }}>
              ✨ {ally.name} のスキル
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
              {ally.skills.map((sk) => {
                const skill = SKILL_MAP[sk];
                const noMp = skill ? ally.mp < skill.mpCost : false;
                return (
                  <Button
                    key={sk}
                    variant="outlined"
                    color="primary"
                    fullWidth
                    size="small"
                    disabled={noMp}
                    onClick={() => onSkillSelect(sk)}
                    sx={{ display: "flex", justifyContent: "space-between", px: 1.5, py: 0.75 }}
                  >
                    <Typography component="span" sx={{ fontSize: 12, fontWeight: 700 }}>{sk}</Typography>
                    <Box sx={{ display: "flex", gap: 1.5 }}>
                      {skill && skill.target === "all" && (
                        <Typography component="span" sx={{ fontSize: 10, color: "warning.light" }}>
                          全体
                        </Typography>
                      )}
                      {skill && skill.power > 0 && (
                        <Typography component="span" sx={{ fontSize: 10, color: "error.light" }}>
                          威力{skill.power}
                        </Typography>
                      )}
                      {skill && skill.mpCost > 0 && (
                        <Typography component="span" sx={{ fontSize: 10, color: noMp ? "error.main" : "primary.light" }}>
                          MP{skill.mpCost}
                        </Typography>
                      )}
                      {skill && skill.power === 0 && skill.mpCost === 0 && (
                        <Typography component="span" sx={{ fontSize: 10, color: "text.secondary" }}>
                          補助
                        </Typography>
                      )}
                    </Box>
                  </Button>
                );
              })}
              <Button variant="text" color="inherit" fullWidth size="small" onClick={onBackFromSkill}>
                戻る
              </Button>
            </Box>
          </>
        );
      })()}

      {phase === "targeting" && (
        <>
          <Typography variant="caption" color="warning.main" sx={{ mb: 0.5, display: "block" }}>
            {pendingSkillName ? `${pendingSkillName} — 対象を選択` : "ターゲットを選択"}
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: aliveEnemyIdxs.length === 1 ? "1fr" : "1fr 1fr", gap: 1 }}>
            {aliveEnemyIdxs.map((i) => {
              const enemy = enemies[i]!;
              const scoutRate = pendingCmd === "catch" && activeAlly
                ? Math.min(0.9, Math.max(0.05, enemy.catchRate * (activeAlly.atk / (activeAlly.atk + enemy.def)) * 2))
                : null;
              return (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  size="small"
                  onClick={() => onTargetSelect(i)}
                  key={i}
                  sx={{ flexDirection: "column", lineHeight: 1.3, py: 0.75 }}
                >
                  <span>{enemy.name}</span>
                  {scoutRate !== null && (
                    <Typography component="span" sx={{ fontSize: 10, color: "secondary.main", fontWeight: 700 }}>
                      スカウト {Math.round(scoutRate * 100)}%
                    </Typography>
                  )}
                </Button>
              );
            })}
            <Button variant="text" color="inherit" fullWidth size="small" onClick={onBackFromTarget}>
              戻る
            </Button>
          </Box>
        </>
      )}

      {phase === "ally_targeting" && (
        <>
          <Typography variant="caption" color="success.main" sx={{ mb: 0.5, display: "block" }}>
            {pendingSkillName} — 対象を選択
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {allies.map((ally, i) =>
              ally.hp > 0 ? (
                <Button
                  key={ally.id}
                  variant="outlined"
                  color="success"
                  fullWidth
                  size="small"
                  onClick={() => onAllyTargetSelect(i)}
                  sx={{ display: "flex", justifyContent: "space-between", px: 1.5, py: 0.75 }}
                >
                  <Typography component="span" sx={{ fontSize: 12 }}>{ally.name}</Typography>
                  <Typography component="span" sx={{ fontSize: 10, color: "text.secondary" }}>
                    HP {ally.hp}/{ally.maxHp}
                  </Typography>
                </Button>
              ) : null
            )}
            <Button variant="text" color="inherit" fullWidth size="small" onClick={onBackFromAllyTarget}>
              戻る
            </Button>
          </Box>
        </>
      )}

      {phase === "command" && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="caption" color="success.main">
              {activeAlly?.name} のターン
            </Typography>
            <Button
              size="small"
              variant={isAutoMode ? "contained" : "outlined"}
              color={isAutoMode ? "warning" : "inherit"}
              onClick={onToggleAuto}
              sx={{ fontSize: 10, py: 0.3, px: 1, minWidth: 0 }}
            >
              {isAutoMode ? "🤖 オートON" : "🤖 オートOFF"}
            </Button>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            {COMMANDS.map(({ cmd, label, color }) => (
              <Button
                variant={cmd === "attack" || cmd === "skill" ? "contained" : "outlined"}
                color={color}
                fullWidth
                disabled={isAutoMode}
                onClick={() => onCommand(cmd)}
                sx={{ py: 1 }}
                key={cmd}
              >
                {label}
              </Button>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}
