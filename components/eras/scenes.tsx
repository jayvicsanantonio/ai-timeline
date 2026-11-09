// The story's scenes, each played right after the event that sets it off, in a screen drawn in the era's generation:
// a line evolving as the reader scrolls through it, a human-versus-machine battle whose HP bars drain to the final score,
// a move used, a legendary encounter, the weather of an AI winter, or a word from the field's founders. The art is
// decorative; the scene's text says everything it shows.
'use client';

import type { CSSProperties } from 'react';
import { Sprite } from '@/components/ui/sprite';
import type { BattleSide, PlayedScene } from '@/lib/dex';
import { cn } from '@/lib/utils';

interface SceneProps {
  played: PlayedScene;
  pixelated: boolean;
}

export function Scene({ played, pixelated }: SceneProps) {
  const { scene } = played;

  return (
    <figure
      id={played.id}
      data-scene={scene.kind}
      className="dex-scene reveal-on-scroll scroll-mt-[calc(var(--timeline-sticky-offset,0px)+1.5rem)]"
    >
      <div aria-hidden="true" className={cn('dex-scene-screen', scene.kind === 'weather' && scene.weather === 'hail' && 'is-hail')}>
        {scene.kind === 'evolution' && played.from && played.to ? (
          <div className="evo-stage">
            <Sprite src={played.from.sprite} pixelated={pixelated} className="evo-from scene-sprite" />
            <span className="evo-arrow font-pixel text-xs">▶</span>
            <Sprite src={played.to.sprite} pixelated={pixelated} className="evo-to scene-sprite" />
          </div>
        ) : null}
        {scene.kind === 'battle' && played.backSprite ? (
          <BattleField played={played} pixelated={pixelated} />
        ) : null}
        {(scene.kind === 'move' || scene.kind === 'encounter' || scene.kind === 'weather') && played.sprite ? (
          <div className={cn('scene-solo', `scene-${scene.kind}`)}>
            <Sprite src={played.sprite} pixelated={pixelated} className="scene-sprite" />
          </div>
        ) : null}
        {scene.kind === 'dialog' ? <p className="scene-speaker font-pixel">{scene.speaker}</p> : null}
      </div>

      <figcaption className="dex-scene-text">
        {scene.kind === 'dialog' ? <p className="sr-only">{scene.speaker} says:</p> : null}
        {played.lines.map((line, index) => (
          <p
            key={line}
            data-scene-line=""
            className={cn(
              line.length <= 64 ? 'font-pixel text-[0.6875rem] leading-6 sm:text-xs sm:leading-7' : 'text-[15px] leading-7',
              scene.kind === 'evolution' && index === 1 && 'evo-done'
            )}
          >
            {line}
          </p>
        ))}
        {scene.kind === 'evolution' ? (
          <p data-evolution-why="" className="evo-done mt-1 text-[15px] leading-7">
            {scene.why}
          </p>
        ) : null}
        <span aria-hidden="true" className="text-caret dex-scene-caret">
          ▼
        </span>
      </figcaption>
    </figure>
  );
}

// The colors the games give an HP bar as it drains
function hpColor(share: number) {
  if (share > 0.5) return '#3ecf6e';
  if (share > 0.2) return '#f5c33b';
  return '#ef4b3f';
}

function HpBar({ side, label }: { side: BattleSide; label: string }) {
  return (
    <div data-battle-side={label} className="battle-plate">
      <p className="flex items-baseline justify-between gap-3">
        <span className="font-pixel text-[0.625rem] leading-4">{side.name}</span>
        {side.score ? <span className="font-pixel text-[0.625rem] leading-4">{side.score}</span> : null}
      </p>
      <p className="mt-0.5 truncate text-[11px] leading-4 opacity-75">{side.title}</p>
      <p className="mt-1.5 flex items-center gap-1.5">
        <span className="font-pixel text-[0.5rem] text-[#f5a524]">HP</span>
        <span className="hp-track">
          <span
            data-hp={side.share.toFixed(2)}
            className="hp-fill"
            style={{ '--hp': side.share, backgroundColor: hpColor(side.share) } as CSSProperties}
          />
        </span>
      </p>
    </div>
  );
}

// The two sides of a match: the person across the field, and the AI's line from behind on the near side
function BattleField({ played, pixelated }: SceneProps) {
  if (played.scene.kind !== 'battle') {
    return null;
  }
  const { ai, foe } = played.scene;

  return (
    <div className="battle-field">
      <div className="battle-foe">
        <HpBar side={foe} label="foe" />
        <div className="battle-platform battle-platform-far">
          <svg viewBox="0 0 64 64" className="battle-person">
            <circle cx="32" cy="18" r="11" />
            <path d="M10 62c0-14 10-25 22-25s22 11 22 25z" />
          </svg>
        </div>
      </div>
      <div className="battle-ai">
        <div className="battle-platform battle-platform-near">
          <Sprite src={played.backSprite!} pixelated={pixelated} className="scene-sprite battle-back" />
        </div>
        <HpBar side={{ ...ai, title: `${played.species?.name ?? ''} · ${ai.title}` }} label="ai" />
      </div>
    </div>
  );
}
