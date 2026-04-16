/**
 * public/data/image/ 以下の PNG を静的 URL で公開する。
 *
 * 使い方: SPRITES["スライム.png"]  → "/data/image/スライム.png"
 */
export function getSpriteUrl(filename: string): string {
  return `src/data/image/${filename}`;
}

// 後方互換用: SPRITES["スライム.png"] でアクセス可能な Proxy
export const SPRITES: Record<string, string> = new Proxy({} as Record<string, string>, {
  get(_target, prop: string) {
    return `src/data/image/${prop}`;
  },
  has(_target, prop: string) {
    return typeof prop === "string" && prop.endsWith(".png");
  },
});
