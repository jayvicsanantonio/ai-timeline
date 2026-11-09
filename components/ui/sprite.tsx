// A sprite from public/sprites: a creature, a badge, an item or a type's icon. Sprites load lazily as they scroll near,
// and pixel art keeps its hard edges when scaled up. Most are decorative, with what they show named in text beside them.
import { cn } from '@/lib/utils';

interface SpriteProps {
  src: string;
  // Empty for a decorative sprite, which is what most are
  alt?: string;
  pixelated?: boolean;
  // For sprites in the first screen, which should not wait to load
  eager?: boolean;
  className?: string;
}

export function Sprite({ src, alt = '', pixelated = false, eager = false, className }: SpriteProps) {
  return (
    // The sprites are small static files Next.js need not resize, which the Workers build could not do without a binding
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      data-sprite=""
      className={cn('select-none', pixelated && 'pixelated', className)}
    />
  );
}
