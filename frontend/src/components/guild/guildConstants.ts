import { ENEMY_MASTER } from "../../data/masters/enemyMaster";
import type { EquipSlot } from "../../types/game";

export const SLOT_META: Record<EquipSlot, { label: string; icon: string }> = {
  weapon: { label: "武器", icon: "⚔️" },
  armor: { label: "防具", icon: "🛡️" },
  accessory: { label: "アクセサリ", icon: "💍" },
};

export const SLOT_ORDER: EquipSlot[] = ["weapon", "armor", "accessory"];

export const TYPE_COLORS: Record<string, string> = {
  水: "#3a7bd5",
  地: "#c8a96a",
  光: "#ffd740",
  炎: "#f44336",
  闇: "#7c4dff",
};

export const TYPE_EMOJI: Record<string, string> = {
  水: "💧",
  地: "🌍",
  光: "✨",
  炎: "🔥",
  闇: "🌑",
};

export const RACE_BY_NAME: Record<string, string> = Object.fromEntries(
  ENEMY_MASTER.map((enemy) => [enemy.name, enemy.race])
);
