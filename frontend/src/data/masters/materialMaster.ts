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
  // ── 追加素材 ──
  { id: "mat-012", name: "鱗",              emoji: "🐠", description: "魚類や爬虫類の丈夫な鱗。防具や槍の素材になる" },
  { id: "mat-013", name: "鉄の欠片",        emoji: "⚙️", description: "ゴーレムの体から剥がれた鉄の破片。精錬すれば武具に使える" },
  { id: "mat-014", name: "竜の牙",          emoji: "🐲", description: "水竜から得た巨大な牙。希少な上級装備の素材になる" },
  { id: "mat-015", name: "毒の牙",          emoji: "☠️", description: "ゴブリンや魚人族の牙。刃に塗れば毒効果を付与できる" },
  { id: "mat-016", name: "炎の鱗",          emoji: "🔶", description: "リザードマンの体を覆う炎を帯びた鱗。加工すると熱を保つ" },
  // ── 獣系基礎素材 ──
  { id: "mat-017", name: "獣の爪",          emoji: "🦶", description: "獣類の鋭い爪。武器に加工すると切れ味が増す" },
  { id: "mat-018", name: "柔らかい毛皮",    emoji: "🐰", description: "ウサギや小動物の滑らかな毛皮。軽量防具に最適" },
  { id: "mat-019", name: "羽根",            emoji: "🪶", description: "鳥型モンスターの羽根。矢や武器に使うと速度が上がる" },
  { id: "mat-020", name: "甲羅片",          emoji: "🐢", description: "カメの甲羅の欠片。非常に硬く防具の素材として優秀" },
];

/** id → MaterialItem の引きマップ */
export const MATERIAL_MAP: Record<string, MaterialItem> = Object.fromEntries(
  MATERIAL_MASTER.map((m) => [m.id, m])
);
