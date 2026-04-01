import { SPRITES } from "../data/sprites";

interface SpriteImageProps {
  /** testData の sprite フィールド値（例: "DefaultBoy.png"） */
  sprite: string;
  size?: number;
  alt?: string;
}

/**
 * monster.sprite / enemy.sprite のファイル名を受け取り <img> をレンダリングする。
 * 対応画像が存在しない場合は何も表示しない。
 */
export function SpriteImage({ sprite, size = 48, alt = "" }: SpriteImageProps) {
  const src = SPRITES[sprite];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        imageRendering: "pixelated",
      }}
    />
  );
}
