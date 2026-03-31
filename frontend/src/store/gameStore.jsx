import { createContext, useContext, useReducer } from "react";
import { PLAYER, MONSTERS, ITEMS } from "../data/testData";

const initialState = {
  player: { ...PLAYER },
  monsters: [...MONSTERS],
  items: [...ITEMS],
  scene: "login", // login | guild | field | battle
  notification: null,
  battleState: null,
};

function reducer(state, action) {
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
    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
