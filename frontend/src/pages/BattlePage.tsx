import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, Button, LinearProgress,
  Fade,
} from "@mui/material";
import type { LinearProgressProps } from "@mui/material";
import { useGame } from "../store/gameStore";
import type { Monster, Enemy } from "../types/game";
import { SpriteImage } from "../components/SpriteImage";
import { processBattleDrops } from "../utils/dropUtils";
import BattleEndModal from "../components/BattleEndModal";

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

type BattlePhase = "command" | "targeting" | "end";
type Command = "attack" | "skill" | "catch" | "run";

const COMMANDS: { cmd: Command; label: string; color: "error" | "primary" | "secondary" | "inherit" }[] = [
  { cmd: "attack", label: "⚔ こうげき", color: "error" },
  { cmd: "skill", label: "✨ スキル", color: "primary" },
  { cmd: "catch", label: "🥚 捕獲", color: "secondary" },
  { cmd: "run", label: "💨 逃げる", color: "inherit" },
];

export default function BattlePage() {
  const { state, dispatch } = useGame();
  const { battleState, player, monsters } = state;

  const partyMonsters = monsters.filter((m) => m.isParty);
  if (!battleState || partyMonsters.length === 0) {
    dispatch({ type: "END_BATTLE" });
    return null;
  }

  // 戦闘終了時のドロップ処理
  const handleEndBattle = (victory: boolean = true) => {
    if (!victory) {
      // 敗北時
      setBattleResult({ victory: false });
      setShowResult(true);
      return;
    }

    // 戦闘開始時に保持した敵報酬を使用
    let totalGold = enemyRewards.gold;
    let totalExp = enemyRewards.exp;
    const drops: Record<string, number> = {};
    const levelUps: Array<{
      monsterId: string;
      monsterName: string;
      fromLevel: number;
      toLevel: number;
    }> = [];

    // ドロップ処理（倒した敵のみ）
    const defeatedEnemies = enemies.filter(e => e.hp <= 0);
    defeatedEnemies.forEach(enemy => {
      const enemyDrops = processBattleDrops([enemy.id]);
      Object.entries(enemyDrops).forEach(([materialId, qty]) => {
        drops[materialId] = (drops[materialId] || 0) + qty;
      });
    });

    // パーティモンスターにEXP分配とレベルアップチェック
    const expPerMonster = Math.floor(totalExp / allies.filter(a => a.hp > 0).length);
    
    allies.filter(a => a.hp > 0).forEach(ally => {
      const fromLevel = ally.level;
      let newExp = ally.exp + expPerMonster;
      let newLevel = fromLevel;
      
      // レベルアップチェック
      while (newExp >= ally.expNext) {
        newExp -= ally.expNext;
        newLevel++;
        levelUps.push({
          monsterId: ally.id,
          monsterName: ally.name,
          fromLevel: fromLevel,
          toLevel: newLevel,
        });
      }
      
      // 仮のEXP更新（実際の適用は結果画面で）
      ally.exp = newExp;
      ally.level = newLevel;
    });

    // 報酬をセットして結果画面を表示
    setBattleResult({
      victory: true,
      rewards: {
        gold: totalGold,
        exp: totalExp,
        materials: drops,
        levelUps,
      },
    });
    setShowResult(true);
  };

  const [enemies, setEnemies] = useState<Enemy[]>(() => battleState.enemies.map((e) => ({ ...e })));
  const [allies, setAllies] = useState<Monster[]>(() => partyMonsters.map((m) => ({ ...m })));
  const [activeAllyIdx, setActiveAllyIdx] = useState(0);
  const [pendingCmd, setPendingCmd] = useState<Command | null>(null);
  const [log, setLog] = useState<string[]>(["バトル開始！"]);
  const [phase, setPhase] = useState<BattlePhase>("command");
  const [showResult, setShowResult] = useState(false);
  const [battleResult, setBattleResult] = useState<{
    victory: boolean;
    rewards?: {
      gold: number;
      exp: number;
      materials: Record<string, number>;
      levelUps: Array<{
        monsterId: string;
        monsterName: string;
        fromLevel: number;
        toLevel: number;
      }>;
    };
  }>({ victory: false });

  // 戦闘開始時の敵報酬を保持
  const [enemyRewards, setEnemyRewards] = useState<{ gold: number; exp: number }>({ gold: 0, exp: 0 });

  // 戦闘開始時に敵報酬を計算
  useEffect(() => {
    if (battleState) {
      const totalGold = battleState.enemies.reduce((sum, e) => sum + e.reward.gold, 0);
      const totalExp = battleState.enemies.reduce((sum, e) => sum + e.reward.exp, 0);
      setEnemyRewards({ gold: totalGold, exp: totalExp });
    }
  }, [battleState]);

  // 敗北判定と自動モーダル表示
  useEffect(() => {
    if (phase === "end" && allies.every((a) => a.hp <= 0)) {
      // 敗北時は即座にモーダル表示
      setBattleResult({ victory: false });
      setShowResult(true);
    }
  }, [phase, allies]);

  const aliveEnemyIdxs = enemies.reduce<number[]>((acc, e, i) => {
    if (e.hp > 0) acc.push(i);
    return acc;
  }, []);

  const batchLog = (msgs: string[]) => {
    if (msgs.length === 0) return;
    setLog((prev) => [...[...msgs].reverse(), ...prev].slice(0, 8));
  };

  const doEnemyTurn = (curEnemies: Enemy[], curAllies: Monster[]): { updatedAllies: Monster[]; msgs: string[] } => {
    const updated = curAllies.map((a) => ({ ...a }));
    const msgs: string[] = [];
    for (const enemy of curEnemies) {
      if (enemy.hp <= 0) continue;
      const aliveIdxs = updated.reduce<number[]>((acc, a, i) => {
        if (a.hp > 0) acc.push(i);
        return acc;
      }, []);
      if (aliveIdxs.length === 0) break;
      const tIdx = aliveIdxs[Math.floor(Math.random() * aliveIdxs.length)]!;
      const dmg = Math.max(1, enemy.atk - updated[tIdx]!.def / 2 + Math.floor(Math.random() * 4));
      updated[tIdx]!.hp = Math.max(0, updated[tIdx]!.hp - dmg);
      msgs.push(`${enemy.name}の攻撃！ ${updated[tIdx]!.name}に${dmg}ダメージ！`);
    }
    return { updatedAllies: updated, msgs };
  };

  const advanceTurn = (newEnemies: Enemy[], newAllies: Monster[], actionMsgs: string[], allyIdx: number) => {
    // 敗北判定
    if (newAllies.every((a) => a.hp <= 0)) {
      setEnemies(newEnemies);
      setAllies(newAllies);
      batchLog([...actionMsgs, "全員倒れてしまった..."]);
      setPhase("end");
      return;
    }

    if (newEnemies.every((e) => e.hp <= 0)) {
      setEnemies(newEnemies);
      setAllies(newAllies);
      batchLog([...actionMsgs, "全員倒した！"]);
      setPhase("end");
      // 状態更新後に勝利処理を呼び出し
      setTimeout(() => handleEndBattle(true), 100);
      return;
    }

    const nextIdx = newAllies.findIndex((a, i) => i > allyIdx && a.hp > 0);

    if (nextIdx !== -1) {
      setEnemies(newEnemies);
      setAllies(newAllies);
      batchLog(actionMsgs);
      setActiveAllyIdx(nextIdx);
      setPhase("command");
    } else {
      const { updatedAllies, msgs: eMsgs } = doEnemyTurn(newEnemies, newAllies);
      setEnemies(newEnemies);
      setAllies(updatedAllies);
      batchLog([...actionMsgs, ...eMsgs]);

      if (updatedAllies.every((a) => a.hp <= 0)) {
        setLog((prev) => ["全員やられた…", ...prev].slice(0, 8));
        setPhase("end");
        return;
      }

      const firstAlive = updatedAllies.findIndex((a) => a.hp > 0);
      setActiveAllyIdx(firstAlive);
      setPhase("command");
    }
  };

  const executeAction = (cmd: Command, targetEnemyIdx: number) => {
    setPendingCmd(null);
    const newEnemies = enemies.map((e) => ({ ...e }));
    const newAllies = allies.map((a) => ({ ...a }));
    const msgs: string[] = [];
    const ally = newAllies[activeAllyIdx]!;
    const target = newEnemies[targetEnemyIdx]!;

    if (cmd === "attack") {
      const dmg = Math.max(1, ally.atk - target.def / 2 + Math.floor(Math.random() * 6));
      target.hp = Math.max(0, target.hp - dmg);
      msgs.push(`${ally.name}の攻撃！ ${target.name}に${dmg}ダメージ！`);
      if (target.hp <= 0) msgs.push(`${target.name}を倒した！`);
    } else if (cmd === "skill") {
      const skill = ally.skills[1] ?? ally.skills[0] ?? "たいあたり";
      const dmg = Math.floor(Math.max(1, ally.atk * 1.5 - target.def / 2 + Math.floor(Math.random() * 8)));
      target.hp = Math.max(0, target.hp - dmg);
      msgs.push(`${ally.name}は${skill}を使った！ ${target.name}に${dmg}ダメージ！`);
      if (target.hp <= 0) msgs.push(`${target.name}を倒した！`);
    } else if (cmd === "catch") {
      const rate = target.catchRate * (1 - target.hp / target.maxHp) * 2;
      if (Math.random() < rate) {
        msgs.push(`${target.name}を仲間にした！`);
        target.hp = 0;
        dispatch({
          type: "ADD_MONSTER",
          payload: {
            ...battleState.enemies[targetEnemyIdx]!,
            id: `mon-${Date.now()}`,
            hp: 1,
            isParty: false,
            personality: "普通",
            skills: [],
            equipped: { weapon: null, armor: null, accessory: null },
            exp: 0,
            expNext: 50,
          } as Monster,
        });
        dispatch({ type: "NOTIFY", payload: { message: `🎉 ${target.name}が仲間になった！`, severity: "success" } });
      } else {
        msgs.push(`${target.name}は逃げ出した！ 捕獲失敗…`);
      }
    }

    advanceTurn(newEnemies, newAllies, msgs, activeAllyIdx);
  };

  const handleCommand = (cmd: Command) => {
    if (phase !== "command") return;
    if (cmd === "run") {
      handleEndBattle();
      return;
    }
    if (aliveEnemyIdxs.length === 1) {
      executeAction(cmd, aliveEnemyIdxs[0]!);
    } else {
      setPendingCmd(cmd);
      setPhase("targeting");
    }
  };

  const handleTargetSelect = (enemyIdx: number) => {
    if (!pendingCmd) return;
    executeAction(pendingCmd, enemyIdx);
  };

  const activeAlly = allies[activeAllyIdx];

  return (
    <>
      <Fade in>
        <Box sx={{
          height: "calc(100vh - 48px)",
          bgcolor: "#0d0d2e",
          display: "flex",
          flexDirection: "column",
          p: 1,
          gap: 1,
          overflow: "hidden",
          boxSizing: "border-box",
        }}>

        {/* タイトル */}
        <Typography variant="subtitle2" sx={{ color: "primary.main", textAlign: "center", flexShrink: 0 }}>
          ⚔ バトル
        </Typography>

        {/* 左: 敵 ／ 右: 味方 */}
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>

          {/* 敵 (左) */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Typography variant="caption" color="error.main" textAlign="center" display="block">
              敵 {aliveEnemyIdxs.length}/{enemies.length}
            </Typography>
            {enemies.map((enemy, i) => (
              <Fade in={true} timeout={300} key={`${enemy.id}-${i}`}>
                <Card sx={{
                  bgcolor: enemy.hp <= 0 ? "rgba(80,80,80,0.1)" : "rgba(244,67,54,0.1)",
                  border: `1px solid ${enemy.hp <= 0 ? "rgba(80,80,80,0.2)" : "rgba(244,67,54,0.4)"}`,
                  opacity: enemy.hp <= 0 ? 0.35 : 1,
                  transition: "opacity 0.3s",
                }}>
                  <CardContent sx={{ p: "6px 8px !important" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                      <SpriteImage sprite={enemy.sprite} size={36} alt={enemy.name} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, lineHeight: 1.2 }} noWrap>
                          {enemy.name}
                        </Typography>
                        <Typography sx={{ fontSize: 10 }} color="text.secondary">Lv.{enemy.level}</Typography>
                      </Box>
                    </Box>
                    <StatBar label="HP" value={enemy.hp} max={enemy.maxHp} color="error" />
                  </CardContent>
                </Card>
              </Fade>
            ))}
          </Box>

          {/* 味方 (右) */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Typography variant="caption" color="success.main" textAlign="center" display="block">
              味方 {allies.filter((a) => a.hp > 0).length}/{allies.length}
            </Typography>
            {allies.map((ally, i) => {
              const isActive = i === activeAllyIdx && phase !== "end" && ally.hp > 0;
              return (
                <Fade in={true} timeout={300} key={ally.id} style={{ transitionDelay: `${i * 60}ms` }}>
                  <Card sx={{
                    bgcolor: ally.hp <= 0 ? "rgba(80,80,80,0.1)" : "rgba(76,175,80,0.1)",
                    border: `1px solid ${isActive ? "#4caf50" : ally.hp <= 0 ? "rgba(80,80,80,0.2)" : "rgba(76,175,80,0.3)"}`,
                    opacity: ally.hp <= 0 ? 0.35 : 1,
                    boxShadow: isActive ? "0 0 6px rgba(76,175,80,0.6)" : "none",
                    transition: "all 0.3s",
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
                </Fade>
              );
            })}
          </Box>
        </Box>

        {/* バトルログ (残りスペースを吸収) */}
        <Card sx={{ bgcolor: "rgba(0,0,0,0.5)", flex: 1, minHeight: 0, overflow: "hidden" }}>
          <CardContent sx={{ p: "8px 10px !important", height: "100%", overflow: "hidden" }}>
            {log.map((l, i) => (
              <Typography
                key={i}
                variant="caption"
                display="block"
                color={i === 0 ? "white" : "text.secondary"}
                sx={{ opacity: Math.max(0.2, 1 - i * 0.18), lineHeight: 1.5 }}
              >
                {l}
              </Typography>
            ))}
          </CardContent>
        </Card>

        {/* コマンド / ターゲット選択 / 終了 */}
        <Box sx={{ flexShrink: 0 }}>
          {phase === "end" && allies.some(a => a.hp > 0) ? (
            <Button variant="contained" size="large" fullWidth onClick={() => handleEndBattle(true)}>
              フィールドへ戻る
            </Button>
          ) : phase === "targeting" ? (
            <>
              <Typography variant="caption" color="warning.main" sx={{ mb: 0.5, display: "block" }}>
                ターゲットを選択
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: aliveEnemyIdxs.length === 1 ? "1fr" : "1fr 1fr", gap: 1 }}>
                {aliveEnemyIdxs.map((i) => (
                  <Button variant="outlined" color="error" fullWidth size="small" onClick={() => handleTargetSelect(i)} key={i}>
                    {enemies[i]!.sprite} {enemies[i]!.name}
                  </Button>
                ))}
                <Button variant="text" color="inherit" fullWidth size="small"
                  onClick={() => { setPendingCmd(null); setPhase("command"); }}>
                  戻る
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Typography variant="caption" color="success.main" sx={{ mb: 0.5, display: "block" }}>
                {activeAlly?.name} のターン
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                {COMMANDS.map(({ cmd, label, color }) => (
                  <Button
                    variant={cmd === "attack" ? "contained" : cmd === "skill" ? "contained" : "outlined"}
                    color={color}
                    fullWidth
                    onClick={() => handleCommand(cmd)}
                    disabled={phase !== "command"}
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

      </Box>

      </Fade>

      {/* Battle End Modal */}
      <BattleEndModal
        open={showResult}
        victory={battleResult.victory}
        rewards={battleResult.rewards}
        onClose={() => {
          setShowResult(false);
          dispatch({ type: "END_BATTLE" });
        }}
      />
    </>
  );
}
