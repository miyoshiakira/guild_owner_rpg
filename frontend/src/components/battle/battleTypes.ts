// ── 戦闘ログ型 ───────────────────────────────────────────────────────────
export interface LogSegment { text: string; color?: string; bold?: boolean }
export type LogLine = LogSegment[];

// ── ログ構築ヘルパー ─────────────────────────────────────────────────────
export const ls  = (text: string):  LogSegment => ({ text });
export const lsA = (name: string):  LogSegment => ({ text: name, color: "#81c784", bold: true }); // 味方 (緑)
export const lsE = (name: string):  LogSegment => ({ text: name, color: "#ef9a9a", bold: true }); // 敵   (赤)
export const lsD = (n: number):     LogSegment => ({ text: String(n), color: "#ffb74d", bold: true }); // ダメージ (橙)
export const lsH = (n: number):     LogSegment => ({ text: String(n), color: "#80cbc4", bold: true }); // 回復 (水色)
export const lsW = (text: string):  LogSegment => ({ text, color: "#fff176" }); // 有効性 (黄)
export const lsK = (name: string):  LogSegment => ({ text: name, color: "#ce93d8" }); // スキル名 (紫)

// ── フェーズ・コマンド型 ─────────────────────────────────────────────────
export type BattlePhase = "command" | "skill_select" | "targeting" | "ally_targeting" | "end";
export type Command = "attack" | "skill" | "catch" | "run";
export type BattleEndReason = "victory" | "defeat" | "run" | "scout";
