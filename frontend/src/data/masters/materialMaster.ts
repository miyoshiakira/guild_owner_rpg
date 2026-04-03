import type { MaterialItem } from "../../types/masters";

export const MATERIAL_MASTER: MaterialItem[] = [
  { id: "mat-001", name: "スライムゼリー",  emoji: "🟢", description: "スライムが残したゼリー。ポーションの原料になる" },
  { id: "mat-002", name: "スライムコア",    emoji: "💠", description: "スライムの核。高純度の魔力を帯びている" },
  { id: "mat-003", name: "獣の毛皮",        emoji: "🟫", description: "オークから剥いだ丈夫な毛皮。防具に使える" },
  { id: "mat-004", name: "硬い骨",          emoji: "🦴", description: "オークの頑丈な骨。削れば刃になる" },
  { id: "mat-005", name: "魔法の粉",        emoji: "✨", description: "ウィッチが使っていた輝く粉末" },
  { id: "mat-006", name: "魔力の結晶",      emoji: "🔮", description: "純粋な魔力が凝縮した希少な結晶" },
  { id: "mat-007", name: "ゴブリンの牙",    emoji: "🦷", description: "ゴブリンの鋭い牙。加工すると武器の刃になる" },
  { id: "mat-008", name: "骨片",            emoji: "💀", description: "スケルトンから砕けた骨の欠片" },
  { id: "mat-009", name: "炎の結晶",        emoji: "🔥", description: "炎の精霊が宿した結晶。触ると温かい" },
  { id: "mat-010", name: "氷の欠片",        emoji: "🧊", description: "雪原のウルフが纏っていた氷の破片" },
  { id: "mat-011", name: "悪魔の角",        emoji: "😈", description: "深層のデーモンから取れた禍々しい角" },
];

/** id → MaterialItem の引きマップ */
export const MATERIAL_MAP: Record<string, MaterialItem> = Object.fromEntries(
  MATERIAL_MASTER.map((m) => [m.id, m])
);
