/**
 * src/data/image/ 以下の PNG を Vite の glob インポートで一括取得し、
 * ファイル名 → 解決済み URL のマップとして公開する。
 *
 * 使い方: SPRITES["DefaultBoy.png"]  → "/src/data/image/DefaultBoy.png" の解決URL
 */
const modules = import.meta.glob<{ default: string }>("./image/*.png", { eager: true });

export const SPRITES: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [
    path.split("/").pop()!, // "DefaultBoy.png" など
    mod.default,
  ])
);
