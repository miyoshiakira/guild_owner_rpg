import { useState } from "react";
import {
  Box, Card, CardContent, Typography, Button, LinearProgress,
  Chip, Grid, Fade, Grow,
} from "@mui/material";
import { useGame } from "../store/gameStore";

function StatBar({ label, value, max, color }) {
  return (
    <Box sx={{ mb: 0.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption">{value} / {max}</Typography>
      </Box>
      <LinearProgress variant="determinate" value={(value / max) * 100} color={color} sx={{ height: 8, borderRadius: 4 }} />
    </Box>
  );
}

export default function BattlePage() {
  const { state, dispatch } = useGame();
  const { battleState, player, monsters } = state;
  const partyMon = monsters.filter((m) => m.isParty).slice(0, 1)[0];

  const [enemy, setEnemy] = useState({ ...battleState.enemy });
  const [ally, setAlly] = useState({ ...partyMon });
  const [log, setLog] = useState(["バトル開始！"]);
  const [phase, setPhase] = useState("command"); // command | result | end

  const addLog = (msg) => setLog((prev) => [msg, ...prev].slice(0, 5));

  const handleCommand = (cmd) => {
    if (phase !== "command") return;
    setPhase("result");

    let newEnemy = { ...enemy };
    let newAlly = { ...ally };
    let msgs = [];

    if (cmd === "attack") {
      const dmg = Math.max(1, ally.atk - newEnemy.def / 2 + Math.floor(Math.random() * 6));
      newEnemy.hp = Math.max(0, newEnemy.hp - dmg);
      msgs.push(`${ally.name}の攻撃！ ${enemy.name}に${dmg}のダメージ！`);
    } else if (cmd === "skill") {
      const skill = ally.skills[1] || ally.skills[0];
      const dmg = Math.max(1, ally.atk * 1.5 - newEnemy.def / 2 + Math.floor(Math.random() * 8));
      newEnemy.hp = Math.max(0, newEnemy.hp - Math.floor(dmg));
      msgs.push(`${ally.name}は${skill}を使った！ ${enemy.name}に${Math.floor(dmg)}のダメージ！`);
    } else if (cmd === "catch") {
      const success = Math.random() < (enemy.catchRate || 0.2) * (1 - newEnemy.hp / newEnemy.maxHp) * 2;
      if (success) {
        msgs.push(`${newEnemy.name}を仲間にした！`);
        dispatch({
          type: "ADD_MONSTER",
          payload: {
            ...battleState.enemy, id: `mon-${Date.now()}`, hp: newEnemy.hp, isParty: false,
          },
        });
        dispatch({ type: "NOTIFY", payload: { message: `🎉 ${newEnemy.name}が仲間になった！`, severity: "success" } });
        setLog(msgs);
        setTimeout(() => dispatch({ type: "END_BATTLE" }), 1500);
        return;
      } else {
        msgs.push(`${newEnemy.name}は逃げ出した！ 捕獲失敗…`);
      }
    } else if (cmd === "run") {
      msgs.push("逃げ出した！");
      dispatch({ type: "END_BATTLE" });
      return;
    }

    // 敵の反撃
    if (newEnemy.hp > 0) {
      const eDmg = Math.max(1, newEnemy.atk - newAlly.def / 2 + Math.floor(Math.random() * 4));
      newAlly.hp = Math.max(0, newAlly.hp - eDmg);
      msgs.push(`${newEnemy.name}の攻撃！ ${newAlly.name}に${eDmg}のダメージ！`);
    }

    setEnemy(newEnemy);
    setAlly(newAlly);
    msgs.forEach((m) => addLog(m));

    if (newEnemy.hp <= 0) {
      addLog(`${newEnemy.name}を倒した！ EXP+${newEnemy.reward?.exp} Gold+${newEnemy.reward?.gold}`);
      dispatch({ type: "UPDATE_PLAYER", payload: { exp: player.exp + (newEnemy.reward?.exp || 50), gold: player.gold + (newEnemy.reward?.gold || 20) } });
      dispatch({ type: "NOTIFY", payload: { message: `${newEnemy.name}を倒した！ EXP+${newEnemy.reward?.exp}`, severity: "success" } });
      setPhase("end");
    } else if (newAlly.hp <= 0) {
      addLog(`${newAlly.name}は倒れた…`);
      setPhase("end");
    } else {
      setPhase("command");
    }
  };

  return (
    <Fade in>
      <Box sx={{ p: 2, minHeight: "calc(100vh - 48px)", bgcolor: "#0d0d2e", display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" sx={{ mb: 2, color: "primary.main", textAlign: "center" }}>
          ⚔ バトル
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* 敵 */}
          <Grid item xs={6}>
            <Grow in>
              <Card sx={{ bgcolor: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)" }}>
                <CardContent>
                  <Box sx={{ textAlign: "center", fontSize: 48, mb: 1 }}>{enemy.sprite}</Box>
                  <Typography variant="subtitle1" fontWeight={700} textAlign="center">{enemy.name}</Typography>
                  <Chip label={`Lv.${enemy.level}`} size="small" sx={{ display: "block", mx: "auto", mb: 1, width: "fit-content" }} />
                  <StatBar label="HP" value={enemy.hp} max={enemy.maxHp} color="error" />
                </CardContent>
              </Card>
            </Grow>
          </Grid>

          {/* 味方 */}
          <Grid item xs={6}>
            <Grow in style={{ transitionDelay: "100ms" }}>
              <Card sx={{ bgcolor: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)" }}>
                <CardContent>
                  <Box sx={{ textAlign: "center", fontSize: 48, mb: 1 }}>{ally.sprite}</Box>
                  <Typography variant="subtitle1" fontWeight={700} textAlign="center">{ally.name}</Typography>
                  <Chip label={`Lv.${ally.level}`} size="small" sx={{ display: "block", mx: "auto", mb: 1, width: "fit-content" }} />
                  <StatBar label="HP" value={ally.hp} max={ally.maxHp} color="success" />
                  <StatBar label="MP" value={ally.mp} max={ally.maxMp} color="primary" />
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        </Grid>

        {/* バトルログ */}
        <Card sx={{ mb: 2, bgcolor: "rgba(0,0,0,0.5)", flexGrow: 1 }}>
          <CardContent>
            {log.map((l, i) => (
              <Typography key={i} variant="body2" color={i === 0 ? "white" : "text.secondary"} sx={{ opacity: 1 - i * 0.2 }}>
                {l}
              </Typography>
            ))}
          </CardContent>
        </Card>

        {/* コマンド */}
        {phase !== "end" ? (
          <Grid container spacing={1}>
            {[
              { cmd: "attack", label: "⚔ こうげき", color: "error" },
              { cmd: "skill", label: "✨ スキル", color: "primary" },
              { cmd: "catch", label: "🥚 捕獲", color: "secondary" },
              { cmd: "run", label: "💨 逃げる", color: "inherit" },
            ].map(({ cmd, label, color }) => (
              <Grid item xs={6} key={cmd}>
                <Button variant="contained" color={color} fullWidth size="large" onClick={() => handleCommand(cmd)} disabled={phase !== "command"}>
                  {label}
                </Button>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Button variant="contained" size="large" fullWidth onClick={() => dispatch({ type: "END_BATTLE" })}>
            フィールドへ戻る
          </Button>
        )}
      </Box>
    </Fade>
  );
}
