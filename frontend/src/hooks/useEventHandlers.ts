// イベントハンドリングの共通ロジック

import { getEventAtPosition } from "../data/masters/storyEventMaster";
import type { GameState } from "../types/game";

/**
 * アクティベート可能なイベントを取得する
 * @param mapId マップID
 * @param row 行
 * @param col 列
 * @param state ゲーム状態
 * @param eventType イベントタイプ
 * @returns アクティベート可能なイベント
 */
export const getActivatableEvent = (mapId: string, row: number, col: number, state: GameState, eventType?: "interact" | "step") => {
  const eventsAtPos = getEventAtPosition(mapId, row, col);
  const targetEvent = eventsAtPos.find(
    e => !state.storyProgress.completedEvents.includes(e.id) &&
         (!eventType || e.trigger === eventType)
  );
  if (!targetEvent) return null;
  
  // conditions チェック
  if (targetEvent.conditions) {
    if (!targetEvent.conditions.every(c => {
      if (c.type === "flag") {
        const flagValue = state.storyFlags[c.flag!] ?? false;
        return flagValue === c.value;
      }
      return true;
    })) return null;
  }
  
  return targetEvent;
};