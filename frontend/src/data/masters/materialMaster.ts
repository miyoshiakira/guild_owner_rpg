import type { MaterialItem } from "../../types/masters";

export const MATERIAL_MASTER: MaterialItem[] = [
  { id: "mat-001", name: "スライムゼリー",  emoji: "🟢", description: "スライムが残したゼリー。ポーションの原料になる" },
  { id: "mat-002", name: "スライムコア",    emoji: "💠", description: "スライムの核。高純度の魔力を帯びている" },
  { id: "mat-003", name: "獣の毛皮",        emoji: "🟫", description: "オークから剥いだ丈夫な毛皮。防具に使える" },
  { id: "mat-004", name: "硬い骨",          emoji: "🦴", description: "オークの頑丈な骨。削れば刃になる" },
  { id: "mat-005", name: "魔法の粉",        emoji: "✨", description: "ウィッチが使っていた輝く粉末" },
  { id: "mat-006", name: "魔力の結晶",      emoji: "🔮", description: "純粋な魔力が凝縮した希少な結晶" },
];

/** id → MaterialItem の引きマップ */
export const MATERIAL_MAP: Record<string, MaterialItem> = Object.fromEntries(
  MATERIAL_MASTER.map((m) => [m.id, m])
);
