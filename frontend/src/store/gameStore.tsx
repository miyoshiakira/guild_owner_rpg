import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from "react";
import { PLAYER, MONSTERS, ITEMS } from "../data/testData";
import type { GameState, GameAction } from "../types/game";

const initialState: GameState = {
  player: { ...PLAYER },
  monsters: [...MONSTERS],
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
      return { ...state, monsters: [...state.monsters, action.payload] };
    case "START_BATTLE":
      return { ...state, scene: "battle", battleState: action.payload };
    case "END_BATTLE":
      return { ...state, scene: "field", battleState: null };
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
