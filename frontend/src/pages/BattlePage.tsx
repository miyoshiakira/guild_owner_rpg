import { useState, useEffect, useMemo, useRef } from "react";
import {
  Box, Typography, Fade,
} from "@mui/material";
import { useGame } from "../store/gameStore";
import type { Monster, Enemy } from "../types/game";
import { getExpToNextLevel } from "../data/expTable";
import { ENEMY_MAP } from "../data/masters/enemyMaster";
import { SKILL_MAP } from "../data/masters/skillMaster";
import { getElementCoeff, getEffectivenessMsg } from "../data/masters/elementMaster";
import BattleEndModal from "../components/BattleEndModal";
import { BattleActionPanel, BattleLogPanel, BattleStatusPanel, RunConfirmDialog } from "../components/battle/BattlePanels";
import type { BattlePhase, Command, LogLine } from "../components/battle/battleTypes";
import { ls, lsA, lsD, lsE, lsH, lsK, lsW } from "../components/battle/battleTypes";
import { useBgm } from "../contexts/BgmContext";
import { BATTLE_BGM_ID } from "../data/masters/bgmMaster";
import {
  buildBattleResultFromSignal,
  INITIAL_BATTLE_RESULT,
  isAllTargetSkill,
  isHealSkill,
  isSelfSkill,
} from "./battle/battleUtils";
import type { BattleEndSignal, BattleResultState } from "./battle/battleUtils";

export default function BattlePage() {
  const { state, dispatch } = useGame();
  const { play: playBgm } = useBgm();

  // バトル開始時にバトル BGM を再生
  useEffect(() => {
    playBgm(BATTLE_BGM_ID);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
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
  const [log, setLog] = useState<LogLine[]>([[{ text: "⚔ バトル開始！", color: "#ce93d8" }]]);
  const [phase, setPhase] = useState<BattlePhase>("command");
  const [showResult, setShowResult] = useState(false);
  const [battleResult, setBattleResult] = useState<BattleResultState>(INITIAL_BATTLE_RESULT);

  // 戦闘終了シグナル: null = 戦闘中, それ以外 = 結果を処理待ち
  const [battleEndSignal, setBattleEndSignal] = useState<BattleEndSignal | null>(null);
  const [runConfirmOpen, setRunConfirmOpen] = useState(false);
  const isAutoMode = state.isAutoBattle;
  const setIsAutoMode = (value: boolean | ((prev: boolean) => boolean)) => {
    const next = typeof value === "function" ? value(state.isAutoBattle) : value;
    dispatch({ type: "SET_AUTO_BATTLE", payload: next });
  };
  // オートバトル用: レンダーごとに最新クロージャで上書きし、useEffect から呼び出す
  const executeAutoTurnRef = useRef<(() => void) | null>(null);

  // ── 戦闘終了シグナルを検知してモーダルを開く ─────────────────────────
  // useEffect で処理することで、state が完全にコミットされた後に実行される
  useEffect(() => {
    if (!battleEndSignal) return;

    setBattleResult(
      buildBattleResultFromSignal(
        battleEndSignal,
        battleState?.enemies ?? [],
        enemyTotalGold,
        enemyTotalExp
      )
    );
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

  useEffect(() => {
    if (!battleState || partyMonsters.length === 0) {
      dispatch({ type: "END_BATTLE" });
    }
  }, [battleState, partyMonsters.length, dispatch]);

  // ── 以下は hooks 終了後のロジック ──────────────────────────────────────
  if (!battleState || partyMonsters.length === 0) {
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

  const batchLog = (msgs: LogLine[]) => {
    if (msgs.length === 0) return;
    setLog((prev) => [...[...msgs].reverse(), ...prev].slice(0, 10));
  };

  const doEnemyTurn = (curEnemies: Enemy[], curAllies: Monster[]): { updatedAllies: Monster[]; msgs: LogLine[] } => {
    const updated = curAllies.map((a) => ({ ...a }));
    const msgs: LogLine[] = [];
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
      msgs.push([lsE(enemy.name), ls("の攻撃！ "), lsA(updated[tIdx]!.name), ls("に"), lsD(dmg), ls("ダメージ！")]);
      if (updated[tIdx]!.hp <= 0) {
        msgs.push([lsA(updated[tIdx]!.name), ls("は"), { text: "気絶した…", color: "#ef9a9a" }, ls(" 💫")]);
      }
    }
    return { updatedAllies: updated, msgs };
  };

  const advanceTurn = (newEnemies: Enemy[], newAllies: Monster[], actionMsgs: LogLine[], allyIdx: number) => {
    // 敗北判定（プレイヤー行動後）
    if (newAllies.every((a) => a.hp <= 0)) {
      batchLog([...actionMsgs, [{ text: "全員倒れてしまった…", color: "#ef5350" }]]);
      setPhase("end");
      setEnemies(newEnemies);
      setAllies(newAllies);
      setBattleEndSignal({ reason: "defeat", finalAllies: newAllies });
      return;
    }

    // 勝利判定: シグナルをセットして useEffect に委譲する
    if (newEnemies.every((e) => e.hp <= 0)) {
      batchLog([...actionMsgs, [{ text: "🎉 全員倒した！", color: "#81c784" }]]);
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
        setLog((prev) => [[{ text: "全員やられた…", color: "#ef5350" }], ...prev].slice(0, 10));
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
    const msgs: LogLine[] = [];
    const ally = newAllies[activeAllyIdx]!;
    const target = newEnemies[targetEnemyIdx]!;

    if (cmd === "attack") {
      // 装備武器の属性を取得
      const weaponElem = state.equipment.find((e) => e.id === ally.equipped.weapon)?.element;
      const elemCoeff = getElementCoeff(weaponElem, target.type);
      const base = ally.atk - target.def / 2 + Math.floor(Math.random() * 6);
      const dmg = Math.max(1, Math.round(base * elemCoeff));
      target.hp = Math.max(0, target.hp - dmg);
      msgs.push([lsA(ally.name), ls("の攻撃！ "), lsE(target.name), ls("に"), lsD(dmg), ls("ダメージ！")]);
      const eMsg = getEffectivenessMsg(elemCoeff);
      if (eMsg) msgs.push([lsW(eMsg)]);
      if (target.hp <= 0) msgs.push([lsE(target.name), ls("を"), { text: "倒した！", color: "#ffb74d" }, ls(" 💀")]);
    } else if (cmd === "skill") {
      const skillName = selectedSkill ?? ally.skills[0] ?? "たいあたり";
      const skillData = SKILL_MAP[skillName];
      const mpCost = skillData?.mpCost ?? 0;
      const skillPower = skillData?.power ?? 75;
      ally.mp = Math.max(0, ally.mp - mpCost);
      const multiplier = skillPower / 75;
      const elemCoeff = getElementCoeff(skillData?.element, target.type);
      // 属性付きスキル（魔法）は防御力を無視する
      const isMagic = skillData?.element !== undefined;
      const base = ally.atk - (isMagic ? target.def / 4 : target.def / 2) + Math.floor(Math.random() * 6);
      const dmg = Math.max(1, Math.floor(base * multiplier * elemCoeff));
      target.hp = Math.max(0, target.hp - dmg);
      msgs.push([lsA(ally.name), ls("は"), lsK(skillName), ls("を使った！ "), lsE(target.name), ls("に"), lsD(dmg), ls("ダメージ！")]);
      const eMsg = getEffectivenessMsg(elemCoeff);
      if (eMsg) msgs.push([lsW(eMsg)]);
      if (target.hp <= 0) msgs.push([lsE(target.name), ls("を"), { text: "倒した！", color: "#ffb74d" }, ls(" 💀")]);
    } else if (cmd === "catch") {
      // スカウト確率: 捕獲率 × (使用者ATK / (使用者ATK + 相手DEF)) × 2 (0%〜90% にクランプ)
      const atkFactor = ally.atk / (ally.atk + target.def);
      const rate = Math.min(0.9, target.catchRate * atkFactor * 2);

      if (Math.random() < rate) {
        msgs.push([lsE(target.name), ls("のスカウトに成功した！ 🥚")]);
        batchLog(msgs);
        // マスタデータを参照して Lv1 ステータスでモンスターを生成
        const master = ENEMY_MAP[target.masterId] ?? target;
        dispatch({
          type: "ADD_MONSTER",
          payload: {
            id: `mon-${Date.now()}`,
            name: master.name,
            type: master.type,
            race: master.race,
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
        msgs.push([lsE(target.name), ls("のスカウト失敗…")]);
      }
    }

    advanceTurn(newEnemies, newAllies, msgs, activeAllyIdx);
  };

  /** 回復スキルを味方に使用 */
  const executeHeal = (skillName: string, targetAllyIdx: number) => {
    setPendingSkillName(null);
    const newEnemies = enemies.map((e) => ({ ...e }));
    const newAllies = allies.map((a) => ({ ...a }));
    const msgs: LogLine[] = [];
    const caster = newAllies[activeAllyIdx]!;
    const target = newAllies[targetAllyIdx]!;
    const skillData = SKILL_MAP[skillName];
    const mpCost = skillData?.mpCost ?? 0;
    caster.mp = Math.max(0, caster.mp - mpCost);
    const healAmt = Math.max(1, Math.floor(20 + caster.level * 5));
    target.hp = Math.min(target.maxHp, target.hp + healAmt);
    msgs.push([lsA(caster.name), ls("は"), lsK(skillName), ls("を使った！ "), lsA(target.name), ls("のHPが"), lsH(healAmt), ls("回復した！ 💚")]);
    advanceTurn(newEnemies, newAllies, msgs, activeAllyIdx);
  };

  /** 自己補助スキル（威力0・MP0）を即時発動 */
  const executeSelfSkill = (skillName: string) => {
    setPendingSkillName(null);
    const newAllies = allies.map((a) => ({ ...a }));
    const msgs: LogLine[] = [[lsA(newAllies[activeAllyIdx]!.name), ls("は"), lsK(skillName), ls("を使った！")]];
    advanceTurn(enemies.map((e) => ({ ...e })), newAllies, msgs, activeAllyIdx);
  };

  /** 全体攻撃スキルを全生存敵に使用 */
  const executeAllTarget = (skillName: string) => {
    setPendingCmd(null);
    setPendingSkillName(null);
    const newEnemies = enemies.map((e) => ({ ...e }));
    const newAllies = allies.map((a) => ({ ...a }));
    const msgs: LogLine[] = [];
    const ally = newAllies[activeAllyIdx]!;
    const skillData = SKILL_MAP[skillName];
    const mpCost = skillData?.mpCost ?? 0;
    const skillPower = skillData?.power ?? 75;
    ally.mp = Math.max(0, ally.mp - mpCost);
    const multiplier = skillPower / 75;
    // 属性付きスキル（魔法）は防御力を無視する
    const isMagicAll = skillData?.element !== undefined;
    msgs.push([lsA(ally.name), ls("は"), lsK(skillName), ls("を使った！")]);
    newEnemies.forEach((target) => {
      if (target.hp <= 0) return;
      const elemCoeff = getElementCoeff(skillData?.element, target.type);
      const base = ally.atk - (isMagicAll ? 0 : target.def / 2) + Math.floor(Math.random() * 6);
      const dmg = Math.max(1, Math.floor(base * multiplier * elemCoeff));
      target.hp = Math.max(0, target.hp - dmg);
      const eMsg = getEffectivenessMsg(elemCoeff);
      const line: LogLine = [lsE(target.name), ls("に"), lsD(dmg), ls("ダメージ！")];
      if (eMsg) line.push(lsW(` ${eMsg}`));
      msgs.push(line);
      if (target.hp <= 0) msgs.push([lsE(target.name), ls("を"), { text: "倒した！", color: "#ffb74d" }, ls(" 💀")]);
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
      batchLog([[{ text: "MPが足りない！", color: "#ef5350" }]]);
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

        <BattleStatusPanel
          enemies={enemies}
          allies={allies}
          aliveEnemyIdxs={aliveEnemyIdxs}
          activeAllyIdx={activeAllyIdx}
          phase={phase}
        />

        <BattleLogPanel log={log} />

        <BattleActionPanel
          phase={phase}
          allies={allies}
          enemies={enemies}
          activeAllyIdx={activeAllyIdx}
          aliveEnemyIdxs={aliveEnemyIdxs}
          pendingCmd={pendingCmd}
          pendingSkillName={pendingSkillName}
          isAutoMode={isAutoMode}
          onToggleAuto={() => setIsAutoMode((prev) => !prev)}
          onCommand={handleCommand}
          onSkillSelect={handleSkillSelect}
          onTargetSelect={handleTargetSelect}
          onAllyTargetSelect={handleAllyTargetSelect}
          onBackFromSkill={() => setPhase("command")}
          onBackFromTarget={() => {
            const hasPendingSkill = pendingSkillName !== null;
            setPendingCmd(null);
            setPendingSkillName(null);
            setPhase(hasPendingSkill ? "skill_select" : "command");
          }}
          onBackFromAllyTarget={() => {
            setPendingSkillName(null);
            setPhase("skill_select");
          }}
        />

      </Box>
      </Fade>

      <RunConfirmDialog
        open={runConfirmOpen}
        onClose={() => setRunConfirmOpen(false)}
        onConfirm={() => {
          setRunConfirmOpen(false);
          setBattleEndSignal({ reason: "run", finalAllies: allies });
          setPhase("end");
        }}
      />

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
