import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode, type Dispatch } from "react";
import { saveGameData, loadGameData, hasSaveData } from "../db/saveService";
import { INIT_PLAYER, INIT_MONSTERS, INIT_ITEMS, INIT_EQUIPMENT } from "../data/initData";
import { getExpToNextLevel } from "../data/expTable";
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
      const { player, monsters, equipment, items, materials, visitedMapIds } = action.payload;
      return {
        ...state,
        ...(player         ? { player }         : {}),
        ...(monsters       ? { monsters }       : {}),
        ...(equipment      ? { equipment }      : {}),
        ...(items          ? { items }          : {}),
        ...(materials      ? { materials }      : {}),
        ...(visitedMapIds  ? { visitedMapIds }  : {}),
      };
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

        let hpIncrease = 0, mpIncrease = 0, atkIncrease = 0, defIncrease = 0, spdIncrease = 0;
        for (let i = 0; i < levelDiff; i++) {
          hpIncrease  += Math.floor(Math.random() * 5) + 3; // 3-7
          mpIncrease  += Math.floor(Math.random() * 3) + 1; // 1-3
          atkIncrease += Math.floor(Math.random() * 3) + 1; // 1-3
          defIncrease += Math.floor(Math.random() * 3) + 1; // 1-3
          spdIncrease += Math.floor(Math.random() * 2) + 1; // 1-2
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

  // アプリ起動時にセーブデータを読み込む
  useEffect(() => {
    const initializeGame = async () => {
      try {
        const hasData = await hasSaveData();
        if (hasData) {
          const savedData = await loadGameData();
          console.log("Loaded save data:", savedData);
          
          // 読み込んだデータで状態を更新
          dispatch({
            type: "LOAD_SAVE",
            payload: {
              ...(savedData.player        ? { player:        savedData.player }        : {}),
              ...(savedData.monsters      ? { monsters:      savedData.monsters }      : {}),
              ...(savedData.equipment     ? { equipment:     savedData.equipment }     : {}),
              ...(savedData.items         ? { items:         savedData.items }         : {}),
              ...(savedData.materials     ? { materials:     savedData.materials }     : {}),
              ...(savedData.visitedMapIds ? { visitedMapIds: savedData.visitedMapIds } : {}),
            },
          });
        }
      } catch (error) {
        console.error("Failed to load save data:", error);
      }
    };

    initializeGame();
  }, []);

  // ログイン後（scene !== "login"）の状態変化を検知してデバウンスセーブ
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (state.scene === "login") return; // ログイン画面ではセーブしない

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveGameData({
        player: state.player,
        monsters: state.monsters,
        equipment: state.equipment,
        items: state.items,
        materials: state.materials,
        visitedMapIds: state.visitedMapIds,
      });
    }, 1500);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state.player, state.monsters, state.equipment, state.items, state.materials, state.visitedMapIds, state.scene]);

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
