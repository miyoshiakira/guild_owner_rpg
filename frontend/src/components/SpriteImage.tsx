import { getSpriteUrl } from "../data/sprites";

interface SpriteImageProps {
  /** monster.sprite / enemy.sprite のファイル名（例: "スライム.png"） */
  sprite: string;
  size?: number;
  alt?: string;
}

/**
 * monster.sprite / enemy.sprite のファイル名を受け取り <img> をレンダリングする。
 */
export function SpriteImage({ sprite, size = 48, alt = "" }: SpriteImageProps) {
  const src = getSpriteUrl(sprite);
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
