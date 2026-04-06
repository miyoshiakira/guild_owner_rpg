import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode, type Dispatch } from "react";
import { saveGameData, saveSlotMeta } from "../db/saveService";
import { INIT_PLAYER, INIT_MONSTERS, INIT_ITEMS, INIT_EQUIPMENT } from "../data/initData";
import { getExpToNextLevel } from "../data/expTable";
import { PERSONALITY_MAP, DEFAULT_PERSONALITY_GROWTH } from "../data/masters/personalityMaster";
import { TYPE_GROWTH_MAP, DEFAULT_TYPE_GROWTH } from "../data/masters/typeGrowthMaster";
import { RACE_MAP, DEFAULT_RACE_GROWTH } from "../data/masters/raceMaster";
import type { GameState, GameAction, EquipSlot } from "../types/game";
import type { CraftRecipe } from "../types/masters";

const initialState: GameState = {
  player: { ...INIT_PLAYER },
  monsters: INIT_MONSTERS.map((m) => ({ ...m, equipped: { ...m.equipped } })),
  equipment: INIT_EQUIPMENT.map((e) => ({ ...e })),
  items: [...INIT_ITEMS],
  materials: {}, // 素材アイテムの所持数
  scene: "login",
  notification: null,
  battleState: null,
  visitedMapIds: ["map-001"], // 初期マップは訪問済み
  isAutoBattle: false,
  activeSlot: 1,
};

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "SET_SCENE":
      return { ...state, scene: action.payload };
    case "NOTIFY":
      return { ...state, notification: action.payload };
    case "CLEAR_NOTIFY":
      return { ...state, notification: null };
    case "UPDATE_PLAYER":
      return { ...state, player: { ...state.player, ...action.payload } };
    case "ADD_MONSTER":
      return {
        ...state,
        monsters: [...state.monsters, {
          ...action.payload,
          equipped: { weapon: null, armor: null, accessory: null },
        }],
      };
    case "START_BATTLE":
      return { ...state, scene: "battle", battleState: action.payload };
    case "END_BATTLE":
      return { ...state, scene: "field", battleState: null };

    case "EQUIP": {
      const { equipmentId, monsterId, slot } = action.payload;
      const eq = state.equipment.find((e) => e.id === equipmentId);
      if (!eq || eq.slot !== slot) return state; // スロット種別不一致は無視

      const targetMonster = state.monsters.find((m) => m.id === monsterId);
      if (!targetMonster) return state;

      const displacedEqId = targetMonster.equipped[slot]; // 取り外される装備
      const prevMonsterId = eq.equippedTo;               // 装備の元の持ち主

      return {
        ...state,
        equipment: state.equipment.map((e) => {
          if (e.id === equipmentId) return { ...e, equippedTo: monsterId };
          if (e.id === displacedEqId) return { ...e, equippedTo: null }; // 倉庫へ
          return e;
        }),
        monsters: state.monsters.map((m) => {
          if (m.id === monsterId) {
            return { ...m, equipped: { ...m.equipped, [slot]: equipmentId } };
          }
          // 別のモンスターから持ってきた場合、元のスロットを空に
          if (prevMonsterId && m.id === prevMonsterId && prevMonsterId !== monsterId) {
            return { ...m, equipped: { ...m.equipped, [slot as EquipSlot]: null } };
          }
          return m;
        }),
      };
    }

    case "SET_PARTY": {
      const { monsterId, isParty } = action.payload;
      return {
        ...state,
        monsters: state.monsters.map((m) =>
          m.id === monsterId ? { ...m, isParty } : m
        ),
      };
    }

    case "LOAD_SAVE": {
      const { player, monsters, equipment, items, materials, visitedMapIds, isAutoBattle, activeSlot } = action.payload;
      return {
        ...state,
        ...(player              ? { player }              : {}),
        ...(monsters            ? { monsters }            : {}),
        ...(equipment           ? { equipment }           : {}),
        ...(items               ? { items }               : {}),
        ...(materials           ? { materials }           : {}),
        ...(visitedMapIds       ? { visitedMapIds }       : {}),
        ...(isAutoBattle !== undefined ? { isAutoBattle } : {}),
        ...(activeSlot          ? { activeSlot }          : {}),
      };
    }

    case "SET_SLOT": {
      return { ...state, activeSlot: action.payload };
    }

    case "UNEQUIP": {
      const { equipmentId } = action.payload;
      const eq = state.equipment.find((e) => e.id === equipmentId);
      if (!eq || !eq.equippedTo) return state;

      return {
        ...state,
        equipment: state.equipment.map((e) =>
          e.id === equipmentId ? { ...e, equippedTo: null } : e
        ),
        monsters: state.monsters.map((m) =>
          m.id === eq.equippedTo
            ? { ...m, equipped: { ...m.equipped, [eq.slot]: null } }
            : m
        ),
      };
    }

    case "ADD_EQUIPMENT": {
      return {
        ...state,
        equipment: [...state.equipment, action.payload],
      };
    }

    case "ADD_MATERIALS": {
      const newMaterials = { ...state.materials };
      Object.entries(action.payload).forEach(([materialId, qty]) => {
        newMaterials[materialId] = Math.max(0, (newMaterials[materialId] || 0) + qty);
        if (newMaterials[materialId] === 0) {
          delete newMaterials[materialId];
        }
      });
      return { ...state, materials: newMaterials };
    }

    case "CRAFT": {
      const recipe = action.payload;
      
      // 素材はADD_MATERIALSで別途消費されるため、ここでは結果のアイテム/装備品のみ追加
      
      if (recipe.result.type === "equipment") {
        const newEquipment = {
          id: `eq-${Date.now()}`,
          name: recipe.result.name,
          slot: recipe.result.slot,
          effect: recipe.result.effect,
          atkBonus: recipe.result.atkBonus,
          defBonus: recipe.result.defBonus,
          spdBonus: recipe.result.spdBonus,
          sprite: recipe.result.sprite,
          equippedTo: null,
        };
        
        const newEquipmentList = Array(recipe.resultQty).fill(null).map((_, index) => ({
          ...newEquipment,
          id: `${newEquipment.id}-${index}`,
        }));
        
        return {
          ...state,
          equipment: [...state.equipment, ...newEquipmentList],
        };
      } else {
        // 消耗品の場合
        const result = recipe.result as any; // 型アサーションで回避
        const existingItem = state.items.find(item => item.id === result.id);
        
        if (existingItem) {
          return {
            ...state,
            items: state.items.map(item =>
              item.id === result.id
                ? { ...item, quantity: item.quantity + recipe.resultQty }
                : item
            ),
          };
        } else {
          const newItem = {
            id: result.id,
            name: result.name,
            type: result.itemType,
            quantity: recipe.resultQty,
            effect: result.effect,
            sprite: result.sprite,
          };
          return {
            ...state,
            items: [...state.items, newItem],
          };
        }
      }
    }

    case "APPLY_BATTLE_REWARDS": {
      const { gold, materials, monsterExpUpdates } = action.payload;

      const newMaterials = { ...state.materials };
      Object.entries(materials).forEach(([materialId, qty]) => {
        newMaterials[materialId] = (newMaterials[materialId] || 0) + qty;
        if (newMaterials[materialId] === 0) delete newMaterials[materialId];
      });

      const newMonsters = state.monsters.map((monster) => {
        const update = monsterExpUpdates.find((u) => u.monsterId === monster.id);
        if (!update) return monster;

        const levelDiff = update.finalLevel - monster.level;
        if (levelDiff === 0) return { ...monster, exp: update.finalExp };

        // 性格・属性・種族マスタから成長係数を取得
        const pGrowth = PERSONALITY_MAP[monster.personality]?.growth ?? DEFAULT_PERSONALITY_GROWTH;
        const tGrowth = TYPE_GROWTH_MAP[monster.type]?.growth    ?? DEFAULT_TYPE_GROWTH;
        const rGrowth = RACE_MAP[monster.race ?? ""]?.growth     ?? DEFAULT_RACE_GROWTH;

        let hpIncrease = 0, mpIncrease = 0, atkIncrease = 0, defIncrease = 0, spdIncrease = 0;
        for (let i = 0; i < levelDiff; i++) {
          // 基礎乱数 × 性格係数 × 属性係数 × 種族係数（最低1、MPのみ最低0）
          hpIncrease  += Math.max(1, Math.round((Math.random() * 5 + 3) * pGrowth.hp  * tGrowth.hp  * rGrowth.hp));
          mpIncrease  += Math.max(0, Math.round((Math.random() * 3 + 1) * pGrowth.mp  * tGrowth.mp  * rGrowth.mp));
          atkIncrease += Math.max(1, Math.round((Math.random() * 3 + 1) * pGrowth.atk * tGrowth.atk * rGrowth.atk));
          defIncrease += Math.max(1, Math.round((Math.random() * 3 + 1) * pGrowth.def * tGrowth.def * rGrowth.def));
          spdIncrease += Math.max(1, Math.round((Math.random() * 2 + 1) * pGrowth.spd * tGrowth.spd * rGrowth.spd));
        }

        return {
          ...monster,
          exp: update.finalExp,
          level: update.finalLevel,
          expNext: getExpToNextLevel(update.finalLevel),
          maxHp: monster.maxHp + hpIncrease,
          hp: monster.hp + hpIncrease,
          maxMp: monster.maxMp + mpIncrease,
          mp: monster.mp + mpIncrease,
          atk: monster.atk + atkIncrease,
          def: monster.def + defIncrease,
          spd: monster.spd + spdIncrease,
        };
      });

      return {
        ...state,
        player: { ...state.player, gold: state.player.gold + gold },
        materials: newMaterials,
        monsters: newMonsters,
      };
    }

    case "LOAD_MONSTERS": {
      return {
        ...state,
        monsters: action.payload,
      };
    }

    case "RENAME_MONSTER": {
      const { monsterId, name } = action.payload;
      return {
        ...state,
        monsters: state.monsters.map((m) =>
          m.id === monsterId ? { ...m, name } : m
        ),
      };
    }

    case "REORDER_MONSTERS": {
      const newPartyOrder = action.payload; // party member IDs in new order
      const result = [...state.monsters];
      // パーティメンバーが占めているインデックスを取得
      const partyIndices = result.reduce<number[]>((acc, m, i) => {
        if (m.isParty) acc.push(i);
        return acc;
      }, []);
      // 同じインデックス位置に新しい順序でパーティメンバーを配置
      newPartyOrder.forEach((id, i) => {
        const monster = state.monsters.find((m) => m.id === id);
        if (monster && partyIndices[i] !== undefined) {
          result[partyIndices[i]] = monster;
        }
      });
      return { ...state, monsters: result };
    }

    case "VISIT_MAP": {
      const mapId = action.payload;
      if (state.visitedMapIds.includes(mapId)) return state;
      return { ...state, visitedMapIds: [...state.visitedMapIds, mapId] };
    }

    case "SYNC_MONSTER_STATS": {
      const statMap = new Map(action.payload.map((s) => [s.monsterId, s]));
      return {
        ...state,
        monsters: state.monsters.map((m) => {
          const s = statMap.get(m.id);
          if (!s) return m;
          return { ...m, hp: s.hp, mp: s.mp };
        }),
      };
    }

    case "HEAL_PARTY": {
      return {
        ...state,
        monsters: state.monsters.map((m) =>
          m.isParty ? { ...m, hp: m.maxHp, mp: m.maxMp } : m
        ),
      };
    }

    case "SET_AUTO_BATTLE": {
      return { ...state, isAutoBattle: action.payload };
    }

    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.payload.itemId),
      };
    }

    case "REMOVE_MATERIAL": {
      const newMaterials = { ...state.materials };
      delete newMaterials[action.payload.materialId];
      return { ...state, materials: newMaterials };
    }

    case "REMOVE_EQUIPMENT": {
      const eq = state.equipment.find((e) => e.id === action.payload.equipmentId);
      return {
        ...state,
        equipment: state.equipment.filter((e) => e.id !== action.payload.equipmentId),
        monsters: eq?.equippedTo
          ? state.monsters.map((m) =>
              m.id === eq.equippedTo
                ? { ...m, equipped: { ...m.equipped, [eq.slot]: null } }
                : m
            )
          : state.monsters,
      };
    }

    case "BREED_MONSTER": {
      const { baseId, partnerId } = action.payload;
      const base    = state.monsters.find((m) => m.id === baseId);
      const partner = state.monsters.find((m) => m.id === partnerId);
      if (!base || !partner) return state;

      // スキルは両親の和集合（重複排除）
      const combinedSkills = [...new Set([...base.skills, ...partner.skills])];
      // 性格はどちらかの親からランダム継承
      const newPersonality = Math.random() < 0.5 ? base.personality : partner.personality;
      // ステータスは現在値 + 相手の10分の1
      const newMaxHp = base.maxHp + Math.floor(partner.maxHp / 10);
      const newMaxMp = base.maxMp + Math.floor(partner.maxMp / 10);
      const newAtk   = base.atk  + Math.floor(partner.atk   / 10);
      const newDef   = base.def  + Math.floor(partner.def   / 10);
      const newSpd   = base.spd  + Math.floor(partner.spd   / 10);

      const bredMonster = {
        ...base,
        level: 1,
        exp: 0,
        expNext: getExpToNextLevel(1),
        hp: newMaxHp,
        maxHp: newMaxHp,
        mp: newMaxMp,
        maxMp: newMaxMp,
        atk: newAtk,
        def: newDef,
        spd: newSpd,
        skills: combinedSkills,
        personality: newPersonality,
        breedCount: (base.breedCount ?? 0) + 1,
        isParty: false, // Lv1 になるのでパーティから外す
      };

      return {
        ...state,
        monsters: state.monsters.map((m) => m.id === baseId ? bredMonster : m),
      };
    }

    case "REMOVE_MONSTER": {
      const target = state.monsters.find((m) => m.id === action.payload.monsterId);
      if (!target) return state;
      // 装備を全て外して倉庫に戻す
      const equippedIds = Object.values(target.equipped).filter(Boolean) as string[];
      return {
        ...state,
        monsters: state.monsters.filter((m) => m.id !== action.payload.monsterId),
        equipment: state.equipment.map((e) =>
          equippedIds.includes(e.id) ? { ...e, equippedTo: null } : e
        ),
      };
    }

    case "RESET_GAME": {
      return {
        player: { ...INIT_PLAYER },
        monsters: INIT_MONSTERS.map((m) => ({ ...m, equipped: { ...m.equipped } })),
        equipment: INIT_EQUIPMENT.map((e) => ({ ...e })),
        items: [...INIT_ITEMS],
        materials: {},
        scene: "login",
        notification: null,
        battleState: null,
        visitedMapIds: ["map-001"],
        isAutoBattle: false,
        activeSlot: state.activeSlot, // スロット番号はリセット後も維持
      };
    }

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // スロット選択は LoginPage で行うため、起動時の自動ロードは不要

  // ログイン後（scene !== "login"）の状態変化を検知してデバウンスセーブ
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (state.scene === "login") return; // ログイン画面ではセーブしない

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const slot = state.activeSlot;
      saveGameData({
        player: state.player,
        monsters: state.monsters,
        equipment: state.equipment,
        items: state.items,
        materials: state.materials,
        visitedMapIds: state.visitedMapIds,
        isAutoBattle: state.isAutoBattle,
      }, slot);
      saveSlotMeta(slot, {
        savedAt: new Date().toISOString(),
        playerName: state.player.name,
        playerLevel: state.player.level ?? 1,
        gold: state.player.gold,
      });
    }, 1500);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state.player, state.monsters, state.equipment, state.items, state.materials, state.visitedMapIds, state.isAutoBattle, state.activeSlot, state.scene]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
