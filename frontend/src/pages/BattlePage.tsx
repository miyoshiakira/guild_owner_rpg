import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Card, CardContent, Typography, Button, LinearProgress,
  Fade, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import type { LinearProgressProps } from "@mui/material";
import { useGame } from "../store/gameStore";
import type { Monster, Enemy, BattleRewards } from "../types/game";
import { SpriteImage } from "../components/SpriteImage";
import { processBattleDrops } from "../utils/dropUtils";
import { getExpToNextLevel } from "../data/expTable";
import { ENEMY_MAP } from "../data/masters/enemyMaster";
import { SKILL_MAP } from "../data/masters/skillMaster";
import { getElementCoeff, getEffectivenessMsg } from "../data/masters/elementMaster";
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

type BattlePhase = "command" | "skill_select" | "targeting" | "ally_targeting" | "end";
type Command = "attack" | "skill" | "catch" | "run";

/** スキルが回復系か判定（power=0 かつ mpCost>0） */
function isHealSkill(skillName: string): boolean {
  const s = SKILL_MAP[skillName];
  return s !== undefined && s.power === 0 && s.mpCost > 0;
}
/** スキルが自己補助系か判定（power=0 かつ mpCost=0） */
function isSelfSkill(skillName: string): boolean {
  const s = SKILL_MAP[skillName];
  return s !== undefined && s.power === 0 && s.mpCost === 0;
}
/** スキルが全体攻撃か判定 */
function isAllTargetSkill(skillName: string): boolean {
  const s = SKILL_MAP[skillName];
  return s !== undefined && s.target === "all" && s.power > 0;
}

const COMMANDS: { cmd: Command; label: string; color: "error" | "primary" | "secondary" | "inherit" }[] = [
  { cmd: "attack", label: "⚔ こうげき", color: "error" },
  { cmd: "skill", label: "✨ スキル", color: "primary" },
  { cmd: "catch", label: "🥚 捕獲", color: "secondary" },
  { cmd: "run", label: "💨 逃げる", color: "inherit" },
];

type BattleEndReason = "victory" | "defeat" | "run" | "scout";

// 戦闘終了シグナル: advanceTurn でセットし useEffect でモーダルを開く
interface BattleEndSignal {
  reason: BattleEndReason;
  finalAllies: Monster[]; // state コミット前に確定した味方データ
}

export default function BattlePage() {
  const { state, dispatch } = useGame();
  const { battleState, monsters } = state;

  // ── すべての hooks を条件分岐より前に配置 ──────────────────────────────
  const partyMonsters = useMemo(
    () => monsters.filter((m) => m.isParty),
    [monsters]
  );

  const enemyTotalGold = useMemo(
    () => battleState?.enemies.reduce((sum, e) => sum + e.reward.gold, 0) ?? 0,
    [battleState]
  );
  const enemyTotalExp = useMemo(
    () => battleState?.enemies.reduce((sum, e) => sum + e.reward.exp, 0) ?? 0,
    [battleState]
  );

  const [enemies, setEnemies] = useState<Enemy[]>(
    () => battleState?.enemies.map((e) => ({ ...e })) ?? []
  );
  const [allies, setAllies] = useState<Monster[]>(
    () => (battleState ? partyMonsters.map((m) => ({ ...m })) : [])
  );
  const [activeAllyIdx, setActiveAllyIdx] = useState(0);
  const [pendingCmd, setPendingCmd] = useState<Command | null>(null);
  const [pendingSkillName, setPendingSkillName] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>(["バトル開始！"]);
  const [phase, setPhase] = useState<BattlePhase>("command");
  const [showResult, setShowResult] = useState(false);
  const [battleResult, setBattleResult] = useState<{
    victory: boolean;
    endReason: BattleEndReason;
    rewards?: BattleRewards;
    finalStats: Array<{ monsterId: string; hp: number; mp: number }>;
  }>({ victory: false, endReason: "defeat", finalStats: [] });

  // 戦闘終了シグナル: null = 戦闘中, それ以外 = 結果を処理待ち
  const [battleEndSignal, setBattleEndSignal] = useState<BattleEndSignal | null>(null);
  const [runConfirmOpen, setRunConfirmOpen] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(false);
  // オートバトル用: レンダーごとに最新クロージャで上書きし、useEffect から呼び出す
  const executeAutoTurnRef = useRef<(() => void) | null>(null);

  // ── 戦闘終了シグナルを検知してモーダルを開く ─────────────────────────
  // useEffect で処理することで、state が完全にコミットされた後に実行される
  useEffect(() => {
    if (!battleEndSignal) return;

    const { reason, finalAllies } = battleEndSignal;

    if (reason !== "victory") {
      setBattleResult({
        victory: false,
        endReason: reason,
        finalStats: finalAllies.map((a) => ({ monsterId: a.id, hp: a.hp, mp: a.mp })),
      });
      setShowResult(true);
      return;
    }

    const materials = processBattleDrops(battleState?.enemies ?? []);
    const aliveAllies = finalAllies.filter((a) => a.hp > 0);
    const expPerMonster = aliveAllies.length > 0
      ? Math.floor(enemyTotalExp / aliveAllies.length)
      : 0;

    const levelUps: BattleRewards["levelUps"] = [];
    const monsterExpUpdates = aliveAllies.map((ally) => {
      let exp = ally.exp + expPerMonster;
      let level = ally.level;

      while (exp >= getExpToNextLevel(level)) {
        exp -= getExpToNextLevel(level);
        level++;
      }

      if (level > ally.level) {
        levelUps.push({
          monsterId: ally.id,
          monsterName: ally.name,
          fromLevel: ally.level,
          toLevel: level,
        });
      }

      return {
        monsterId: ally.id,
        expToAdd: expPerMonster,
        finalExp: exp,
        finalLevel: level,
        finalExpNext: getExpToNextLevel(level),
      };
    });

    setBattleResult({
      victory: true,
      endReason: "victory",
      rewards: { gold: enemyTotalGold, exp: enemyTotalExp, materials, levelUps, monsterExpUpdates },
      finalStats: finalAllies.map((a) => ({ monsterId: a.id, hp: a.hp, mp: a.mp })),
    });
    setShowResult(true);
  }, [battleEndSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── オートバトル: command フェーズになったら自動でアクションを実行 ──────
  useEffect(() => {
    if (!isAutoMode || phase !== "command") return;
    const timer = setTimeout(() => {
      executeAutoTurnRef.current?.();
    }, 700);
    return () => clearTimeout(timer);
  }, [isAutoMode, phase, activeAllyIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 以下は hooks 終了後のロジック ──────────────────────────────────────
  if (!battleState || partyMonsters.length === 0) {
    dispatch({ type: "END_BATTLE" });
    return null;
  }

  const aliveEnemyIdxs = enemies.reduce<number[]>((acc, e, i) => {
    if (e.hp > 0) acc.push(i);
    return acc;
  }, []);

  // オートバトル用アクション（レンダーごとに最新クロージャで更新）
  // useEffect より後で定義された関数を安全に呼び出すための ref パターン
  executeAutoTurnRef.current = () => {
    const ally = allies[activeAllyIdx];
    if (!ally || ally.hp <= 0 || aliveEnemyIdxs.length === 0) return;

    // HP50%以下の味方を優先回復
    const injuredEntry = allies
      .map((a, i) => ({ a, i }))
      .filter(({ a }) => a.hp > 0 && a.hp / a.maxHp < 0.5)
      .sort((x, y) => x.a.hp / x.a.maxHp - y.a.hp / y.a.maxHp)[0];

    if (injuredEntry) {
      const healSk = ally.skills.find(
        (sk) => isHealSkill(sk) && ally.mp >= (SKILL_MAP[sk]?.mpCost ?? 0)
      );
      if (healSk) {
        executeHeal(healSk, injuredEntry.i);
        return;
      }
    }

    // 攻撃スキルまたは通常攻撃
    const targetIdx = aliveEnemyIdxs[Math.floor(Math.random() * aliveEnemyIdxs.length)]!;
    const attackSkills = ally.skills.filter((sk) => {
      const s = SKILL_MAP[sk];
      return s && s.power > 0 && ally.mp >= s.mpCost;
    });

    if (attackSkills.length > 0 && Math.random() < 0.6) {
      const sk = attackSkills[Math.floor(Math.random() * attackSkills.length)]!;
      if (isAllTargetSkill(sk)) {
        executeAllTarget(sk);
      } else {
        executeAction("skill", targetIdx, sk);
      }
    } else {
      executeAction("attack", targetIdx);
    }
  };

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
    // 敗北判定（プレイヤー行動後）
    if (newAllies.every((a) => a.hp <= 0)) {
      batchLog([...actionMsgs, "全員倒れてしまった..."]);
      setPhase("end");
      setEnemies(newEnemies);
      setAllies(newAllies);
      setBattleEndSignal({ reason: "defeat", finalAllies: newAllies });
      return;
    }

    // 勝利判定: シグナルをセットして useEffect に委譲する
    if (newEnemies.every((e) => e.hp <= 0)) {
      batchLog([...actionMsgs, "全員倒した！"]);
      setPhase("end");
      setEnemies(newEnemies);
      setAllies(newAllies);
      setBattleEndSignal({ reason: "victory", finalAllies: newAllies });
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

      // 敗北判定（敵行動後）
      if (updatedAllies.every((a) => a.hp <= 0)) {
        setLog((prev) => ["全員やられた…", ...prev].slice(0, 8));
        setPhase("end");
        setBattleEndSignal({ reason: "defeat", finalAllies: updatedAllies });
        return;
      }

      const firstAlive = updatedAllies.findIndex((a) => a.hp > 0);
      setActiveAllyIdx(firstAlive);
      setPhase("command");
    }
  };

  /** 攻撃・捕獲など敵を対象にするアクション */
  const executeAction = (cmd: Command, targetEnemyIdx: number, selectedSkill?: string) => {
    setPendingCmd(null);
    setPendingSkillName(null);
    const newEnemies = enemies.map((e) => ({ ...e }));
    const newAllies = allies.map((a) => ({ ...a }));
    const msgs: string[] = [];
    const ally = newAllies[activeAllyIdx]!;
    const target = newEnemies[targetEnemyIdx]!;

    if (cmd === "attack") {
      // 装備武器の属性を取得
      const weaponElem = state.equipment.find((e) => e.id === ally.equipped.weapon)?.element;
      const elemCoeff = getElementCoeff(weaponElem, target.type);
      const base = ally.atk - target.def / 2 + Math.floor(Math.random() * 6);
      const dmg = Math.max(1, Math.round(base * elemCoeff));
      target.hp = Math.max(0, target.hp - dmg);
      msgs.push(`${ally.name}の攻撃！ ${target.name}に${dmg}ダメージ！`);
      const eMsg = getEffectivenessMsg(elemCoeff);
      if (eMsg) msgs.push(eMsg);
      if (target.hp <= 0) msgs.push(`${target.name}を倒した！`);
    } else if (cmd === "skill") {
      const skillName = selectedSkill ?? ally.skills[0] ?? "たいあたり";
      const skillData = SKILL_MAP[skillName];
      const mpCost = skillData?.mpCost ?? 0;
      const skillPower = skillData?.power ?? 75;
      ally.mp = Math.max(0, ally.mp - mpCost);
      const multiplier = skillPower / 75;
      const elemCoeff = getElementCoeff(skillData?.element, target.type);
      const base = ally.atk - target.def / 2 + Math.floor(Math.random() * 6);
      const dmg = Math.max(1, Math.floor(base * multiplier * elemCoeff));
      target.hp = Math.max(0, target.hp - dmg);
      msgs.push(`${ally.name}は${skillName}を使った！ ${target.name}に${dmg}ダメージ！`);
      const eMsg = getEffectivenessMsg(elemCoeff);
      if (eMsg) msgs.push(eMsg);
      if (target.hp <= 0) msgs.push(`${target.name}を倒した！`);
    } else if (cmd === "catch") {
      // スカウト確率: 捕獲率 × (使用者ATK / (使用者ATK + 相手DEF)) × 2 (5%〜90% にクランプ)
      const atkFactor = ally.atk / (ally.atk + target.def);
      const rate = Math.min(0.9, Math.max(0.05, target.catchRate * atkFactor * 2));

      if (Math.random() < rate) {
        msgs.push(`${target.name}のスカウトに成功した！`);
        batchLog(msgs);
        // マスタデータを参照して Lv1 ステータスでモンスターを生成
        const master = ENEMY_MAP[target.masterId] ?? target;
        dispatch({
          type: "ADD_MONSTER",
          payload: {
            id: `mon-${Date.now()}`,
            name: master.name,
            type: master.type,
            level: 1,
            hp: master.maxHp,
            maxHp: master.maxHp,
            mp: master.maxMp,
            maxMp: master.maxMp,
            atk: master.atk,
            def: master.def,
            spd: master.spd,
            sprite: master.sprite,
            personality: master.personality,
            skills: [...master.skills],
            isParty: false,
            equipped: { weapon: null, armor: null, accessory: null },
            exp: 0,
            expNext: getExpToNextLevel(1),
          } as Monster,
        });
        // スカウト成功 → 他に敵がいても即戦闘終了
        setPhase("end");
        setEnemies(newEnemies);
        setAllies(newAllies);
        setBattleEndSignal({ reason: "scout", finalAllies: newAllies });
        return;
      } else {
        msgs.push(`${target.name}のスカウト失敗…`);
      }
    }

    advanceTurn(newEnemies, newAllies, msgs, activeAllyIdx);
  };

  /** 回復スキルを味方に使用 */
  const executeHeal = (skillName: string, targetAllyIdx: number) => {
    setPendingSkillName(null);
    const newEnemies = enemies.map((e) => ({ ...e }));
    const newAllies = allies.map((a) => ({ ...a }));
    const msgs: string[] = [];
    const caster = newAllies[activeAllyIdx]!;
    const target = newAllies[targetAllyIdx]!;
    const skillData = SKILL_MAP[skillName];
    const mpCost = skillData?.mpCost ?? 0;
    caster.mp = Math.max(0, caster.mp - mpCost);
    const healAmt = Math.max(1, Math.floor(20 + caster.level * 5));
    target.hp = Math.min(target.maxHp, target.hp + healAmt);
    msgs.push(`${caster.name}は${skillName}を使った！ ${target.name}のHPが${healAmt}回復した！`);
    advanceTurn(newEnemies, newAllies, msgs, activeAllyIdx);
  };

  /** 自己補助スキル（威力0・MP0）を即時発動 */
  const executeSelfSkill = (skillName: string) => {
    setPendingSkillName(null);
    const newAllies = allies.map((a) => ({ ...a }));
    const msgs = [`${newAllies[activeAllyIdx]!.name}は${skillName}を使った！`];
    advanceTurn(enemies.map((e) => ({ ...e })), newAllies, msgs, activeAllyIdx);
  };

  /** 全体攻撃スキルを全生存敵に使用 */
  const executeAllTarget = (skillName: string) => {
    setPendingCmd(null);
    setPendingSkillName(null);
    const newEnemies = enemies.map((e) => ({ ...e }));
    const newAllies = allies.map((a) => ({ ...a }));
    const msgs: string[] = [];
    const ally = newAllies[activeAllyIdx]!;
    const skillData = SKILL_MAP[skillName];
    const mpCost = skillData?.mpCost ?? 0;
    const skillPower = skillData?.power ?? 75;
    ally.mp = Math.max(0, ally.mp - mpCost);
    const multiplier = skillPower / 75;
    msgs.push(`${ally.name}は${skillName}を使った！`);
    newEnemies.forEach((target) => {
      if (target.hp <= 0) return;
      const elemCoeff = getElementCoeff(skillData?.element, target.type);
      const base = ally.atk - target.def / 2 + Math.floor(Math.random() * 6);
      const dmg = Math.max(1, Math.floor(base * multiplier * elemCoeff));
      target.hp = Math.max(0, target.hp - dmg);
      const eMsg = getEffectivenessMsg(elemCoeff);
      msgs.push(`${target.name}に${dmg}ダメージ！${eMsg ? ` ${eMsg}` : ""}`);
      if (target.hp <= 0) msgs.push(`${target.name}を倒した！`);
    });
    advanceTurn(newEnemies, newAllies, msgs, activeAllyIdx);
  };

  const handleCommand = (cmd: Command) => {
    if (phase !== "command") return;
    if (cmd === "run") {
      setRunConfirmOpen(true);
      return;
    }
    if (cmd === "skill") {
      setPhase("skill_select");
      return;
    }
    if (aliveEnemyIdxs.length === 1) {
      executeAction(cmd, aliveEnemyIdxs[0]!);
    } else {
      setPendingCmd(cmd);
      setPhase("targeting");
    }
  };

  /** スキル選択後の処理 */
  const handleSkillSelect = (skillName: string) => {
    const skill = SKILL_MAP[skillName];
    const ally = allies[activeAllyIdx]!;
    if (skill && ally.mp < skill.mpCost) {
      batchLog([`MPが足りない！`]);
      return;
    }
    setPendingSkillName(skillName);
    if (isHealSkill(skillName)) {
      setPhase("ally_targeting");
    } else if (isSelfSkill(skillName)) {
      executeSelfSkill(skillName);
    } else if (isAllTargetSkill(skillName)) {
      executeAllTarget(skillName);
    } else {
      // 単体攻撃スキル
      if (aliveEnemyIdxs.length === 1) {
        executeAction("skill", aliveEnemyIdxs[0]!, skillName);
      } else {
        setPhase("targeting");
      }
    }
  };

  const handleTargetSelect = (enemyIdx: number) => {
    if (pendingSkillName) {
      executeAction("skill", enemyIdx, pendingSkillName);
    } else if (pendingCmd) {
      executeAction(pendingCmd, enemyIdx);
    }
  };

  const handleAllyTargetSelect = (allyIdx: number) => {
    if (!pendingSkillName) return;
    executeHeal(pendingSkillName, allyIdx);
  };

  const activeAlly = allies[activeAllyIdx];

  return (
    <>
      <Fade in timeout={400}>
        <Box sx={{
          height: "calc(100vh - 48px)",
          animation: "battle-bg-pulse 4s ease-in-out infinite",
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

        {/* 左: 敵 ／ 右: 味方（3件固定表示・超過分はスクロール） */}
        {/* スクロール高さ = 3枚 × 味方カード高さ(90px) + gap(6px) × 2 = 282px */}
        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>

          {/* 敵 (左) */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Typography variant="caption" color="error.main" textAlign="center" display="block"
              sx={{ flexShrink: 0, mb: 0.75 }}>
              敵 {aliveEnemyIdxs.length}/{enemies.length}
            </Typography>
            <Box className="battle-cards-wrap" sx={{ height: 282, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0.75 }}>
              {enemies.map((enemy, i) => {
                const scoutPct = activeAlly
                  ? Math.round(Math.min(0.9, Math.max(0.05, enemy.catchRate * (activeAlly.atk / (activeAlly.atk + enemy.def)) * 2)) * 100)
                  : Math.round(enemy.catchRate * 100);
                return (
                <Card key={`${enemy.id}-${i}`} style={{ ["--card-delay" as string]: `${i * 70}ms` }} sx={{
                  bgcolor: enemy.hp <= 0 ? "rgba(80,80,80,0.1)" : "rgba(244,67,54,0.1)",
                  border: `1px solid ${enemy.hp <= 0 ? "rgba(80,80,80,0.2)" : "rgba(244,67,54,0.4)"}`,
                  opacity: enemy.hp <= 0 ? 0.35 : 1,
                  transition: "opacity 0.4s, border-color 0.3s",
                  flexShrink: 0,
                  animation: `slide-in-left 0.28s ease-out var(--card-delay, 0ms) both`,
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

          {/* 味方 (右) */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Typography variant="caption" color="success.main" textAlign="center" display="block"
              sx={{ flexShrink: 0, mb: 0.75 }}>
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
                        : `slide-in-right 0.28s ease-out var(--card-delay, 0ms) both`,
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

        {/* バトルログ (残りスペースを吸収) */}
        <Card sx={{ bgcolor: "rgba(0,0,0,0.5)", flex: 1, minHeight: 0, overflow: "hidden" }}>
          <CardContent sx={{ p: "8px 10px !important", height: "100%", overflow: "hidden" }}>
            {log.map((l, i) => (
              <Typography
                key={`${i}-${l}`}
                variant="caption"
                display="block"
                color={i === 0 ? "white" : "text.secondary"}
                sx={{
                  opacity: Math.max(0.2, 1 - i * 0.18),
                  lineHeight: 1.5,
                  animation: i === 0 ? "log-slide-in 0.2s ease-out" : "none",
                }}
              >
                {l}
              </Typography>
            ))}
          </CardContent>
        </Card>

        {/* コマンド / スキル選択 / ターゲット選択 */}
        <Box sx={{ flexShrink: 0 }}>

          {/* ── スキル選択 ── */}
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
                      <Button key={sk} variant="outlined" color="primary" fullWidth size="small"
                        disabled={noMp}
                        onClick={() => handleSkillSelect(sk)}
                        sx={{ display: "flex", justifyContent: "space-between", px: 1.5, py: 0.75 }}>
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
                            <Typography component="span"
                              sx={{ fontSize: 10, color: noMp ? "error.main" : "primary.light" }}>
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
                  <Button variant="text" color="inherit" fullWidth size="small"
                    onClick={() => setPhase("command")}>
                    戻る
                  </Button>
                </Box>
              </>
            );
          })()}

          {/* ── 敵ターゲット選択 ── */}
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
                    <Button variant="outlined" color="error" fullWidth size="small"
                      onClick={() => handleTargetSelect(i)} key={i}
                      sx={{ flexDirection: "column", lineHeight: 1.3, py: 0.75 }}>
                      <span>{enemy.name}</span>
                      {scoutRate !== null && (
                        <Typography component="span" sx={{ fontSize: 10, color: "secondary.main", fontWeight: 700 }}>
                          スカウト {Math.round(scoutRate * 100)}%
                        </Typography>
                      )}
                    </Button>
                  );
                })}
                <Button variant="text" color="inherit" fullWidth size="small"
                  onClick={() => {
                    setPendingCmd(null);
                    setPendingSkillName(null);
                    setPhase(pendingSkillName ? "skill_select" : "command");
                  }}>
                  戻る
                </Button>
              </Box>
            </>
          )}

          {/* ── 味方ターゲット選択（回復スキル用） ── */}
          {phase === "ally_targeting" && (
            <>
              <Typography variant="caption" color="success.main" sx={{ mb: 0.5, display: "block" }}>
                {pendingSkillName} — 対象を選択
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {allies.map((ally, i) =>
                  ally.hp > 0 ? (
                    <Button key={ally.id} variant="outlined" color="success" fullWidth size="small"
                      onClick={() => handleAllyTargetSelect(i)}
                      sx={{ display: "flex", justifyContent: "space-between", px: 1.5, py: 0.75 }}>
                      <Typography component="span" sx={{ fontSize: 12 }}>{ally.name}</Typography>
                      <Typography component="span" sx={{ fontSize: 10, color: "text.secondary" }}>
                        HP {ally.hp}/{ally.maxHp}
                      </Typography>
                    </Button>
                  ) : null
                )}
                <Button variant="text" color="inherit" fullWidth size="small"
                  onClick={() => { setPendingSkillName(null); setPhase("skill_select"); }}>
                  戻る
                </Button>
              </Box>
            </>
          )}

          {/* ── コマンド選択 ── */}
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
                  onClick={() => setIsAutoMode((prev) => !prev)}
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
                    onClick={() => handleCommand(cmd)}
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

      {/* 逃げる確認ダイアログ */}
      <Dialog
        open={runConfirmOpen}
        onClose={() => setRunConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            border: "1px solid rgba(255,152,0,0.3)",
            borderRadius: 2,
            backgroundImage: "none",
          },
        }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid rgba(255,152,0,0.2)", fontWeight: 700 }}>
          💨 逃げる
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            バトルから逃げますか？経験値・ゴールドは獲得できません。
          </Typography>
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid rgba(255,255,255,0.08)", px: 3, py: 1.5, gap: 1 }}>
          <Button onClick={() => setRunConfirmOpen(false)} sx={{ color: "text.secondary" }}>
            戻る
          </Button>
          <Button
            variant="contained"
            color="warning"
            sx={{ fontWeight: 700 }}
            onClick={() => {
              setRunConfirmOpen(false);
              setBattleEndSignal({ reason: "run", finalAllies: allies });
              setPhase("end");
            }}
          >
            逃げる
          </Button>
        </DialogActions>
      </Dialog>

      {/* Battle End Modal */}
      <BattleEndModal
        open={showResult}
        victory={battleResult.victory}
        endReason={battleResult.endReason}
        rewards={battleResult.rewards}
        onClose={() => {
          setShowResult(false);
          // 戦闘中の HP/MP 変化を Store へ書き戻す（回復なし）
          if (battleResult.finalStats.length > 0) {
            dispatch({ type: "SYNC_MONSTER_STATS", payload: battleResult.finalStats });
          }
          if (battleResult.victory && battleResult.rewards) {
            dispatch({ type: "APPLY_BATTLE_REWARDS", payload: battleResult.rewards });
          }
          dispatch({ type: "END_BATTLE" });
        }}
      />
    </>
  );
}
