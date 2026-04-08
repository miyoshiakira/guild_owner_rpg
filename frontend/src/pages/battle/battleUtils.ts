import type { BattleRewards, Enemy, Monster } from "../../types/game";
import { processBattleDrops } from "../../utils/dropUtils";
import { getExpToNextLevel } from "../../data/expTable";
import { SKILL_MAP } from "../../data/masters/skillMaster";
import type { BattleEndReason } from "../../components/battle/battleTypes";

export interface BattleEndSignal {
  reason: BattleEndReason;
  finalAllies: Monster[];
}

export interface BattleResultState {
  victory: boolean;
  endReason: BattleEndReason;
  rewards?: BattleRewards;
  finalStats: Array<{ monsterId: string; hp: number; mp: number }>;
}

export const INITIAL_BATTLE_RESULT: BattleResultState = {
  victory: false,
  endReason: "defeat",
  finalStats: [],
};

export function isHealSkill(skillName: string): boolean {
  const skill = SKILL_MAP[skillName];
  return skill !== undefined && skill.power === 0 && skill.mpCost > 0;
}

export function isSelfSkill(skillName: string): boolean {
  const skill = SKILL_MAP[skillName];
  return skill !== undefined && skill.power === 0 && skill.mpCost === 0;
}

export function isAllTargetSkill(skillName: string): boolean {
  const skill = SKILL_MAP[skillName];
  return skill !== undefined && skill.target === "all" && skill.power > 0;
}

function toFinalStats(allies: Monster[]): Array<{ monsterId: string; hp: number; mp: number }> {
  return allies.map((ally) => ({ monsterId: ally.id, hp: ally.hp, mp: ally.mp }));
}

export function buildBattleResultFromSignal(
  signal: BattleEndSignal,
  enemies: Enemy[],
  enemyTotalGold: number,
  enemyTotalExp: number
): BattleResultState {
  const { reason, finalAllies } = signal;

  if (reason !== "victory") {
    return {
      victory: false,
      endReason: reason,
      finalStats: toFinalStats(finalAllies),
    };
  }

  const materials = processBattleDrops(enemies);
  const aliveAllies = finalAllies.filter((ally) => ally.hp > 0);
  const expPerMonster = aliveAllies.length > 0 ? Math.floor(enemyTotalExp / aliveAllies.length) : 0;

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

  return {
    victory: true,
    endReason: "victory",
    rewards: {
      gold: enemyTotalGold,
      exp: enemyTotalExp,
      materials,
      levelUps,
      monsterExpUpdates,
    },
    finalStats: toFinalStats(finalAllies),
  };
}
