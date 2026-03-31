import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from "react";
import { PLAYER, MONSTERS, ITEMS, EQUIPMENT } from "../data/testData";
import type { GameState, GameAction, EquipSlot } from "../types/game";

const initialState: GameState = {
  player: { ...PLAYER },
  monsters: MONSTERS.map((m) => ({ ...m, equipped: { ...m.equipped } })),
  equipment: EQUIPMENT.map((e) => ({ ...e })),
  items: [...ITEMS],
  scene: "login",
  notification: null,
  battleState: null,
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
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
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
