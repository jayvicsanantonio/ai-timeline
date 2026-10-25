// Miniature pictures of the five era interfaces, shown on the tiles that open the page.
// They are decoration only: every tile names its era and interface in text beside the picture.
'use client';

import type { EraInterface } from '@/lib/eras';
import { cn } from '@/lib/utils';
import { PunchedTitle } from './punch-card-era';

interface EraPreviewProps {
  eraInterface: EraInterface;
  className?: string;
}

export function EraPreview({ eraInterface, className }: EraPreviewProps) {
  return (
    <div aria-hidden="true" className={cn('relative overflow-hidden', className)}>
      {eraInterface === 'punch-card' ? <PunchCardPreview /> : null}
      {eraInterface === 'terminal' ? <TerminalPreview /> : null}
      {eraInterface === 'desktop' ? <DesktopPreview /> : null}
      {eraInterface === 'notebook' ? <NotebookPreview /> : null}
      {eraInterface === 'chat' ? <ChatPreview /> : null}
    </div>
  );
}

function PunchCardPreview() {
  return (
    <div className="punch-card-room grid h-full place-items-center p-3">
      <div className="punch-card w-full -rotate-2 bg-[#f3e9cf] px-2.5 pb-2 pt-2.5 shadow-[0_12px_24px_-12px_rgba(0,0,0,0.9)] transition-transform duration-300 group-hover:rotate-0">
        <PunchedTitle title="THE AI TIMELINE" />
      </div>
    </div>
  );
}

function TerminalPreview() {
  return (
    <div className="crt-scanlines h-full bg-[#04100a] px-3 py-2.5 font-mono text-[10px] leading-4 text-[#5cf09a]">
      <p className="text-[#38b874]">READY.</p>
      <p>&gt; RUN KNOWLEDGE.ERA</p>
      <p className="crt-glow mt-1 text-[13px] font-bold text-[#9dffc4]">THE KNOWLEDGE ERA</p>
      <p className="mt-1 text-[#38b874]">12 RECORDS FOUND.</p>
      <p>
        &gt; <span className="terminal-caret">█</span>
      </p>
    </div>
  );
}

function DesktopPreview() {
  return (
    <div className="desktop-wallpaper font-desktop h-full p-3">
      <div className="desktop-window w-[88%] transition-transform duration-300 group-hover:-translate-y-0.5">
        <div className="desktop-title-bar py-0.5 text-[10px] font-bold">
          <span className="min-w-0 flex-1 truncate">Learning.exe</span>
          <span className="flex gap-px">
            {['_', '□', '×'].map((glyph) => (
              <span
                key={glyph}
                className="desktop-raised grid size-3 place-items-center bg-[#c0c0c0] text-[8px] leading-none text-black"
              >
                {glyph}
              </span>
            ))}
          </span>
        </div>
        <div className="desktop-sunken m-0.5 h-9 bg-white p-1">
          <div className="h-1.5 w-4/5 bg-[#c7c7c7]" />
          <div className="mt-1 h-1.5 w-3/5 bg-[#c7c7c7]" />
        </div>
      </div>
    </div>
  );
}

function NotebookPreview() {
  return (
    <div className="h-full bg-white px-3 py-2.5 font-mono text-[10px] leading-4">
      <p className="flex gap-2">
        <span className="text-[#303f9f]">In [5]:</span>
        <span className="flex-1 truncate rounded-sm border border-[#e0e0e0] bg-[#f7f7f7] px-1">
          <span className="text-[#008000]">milestone</span>(<span className="text-[#ba2121]">&quot;ImageNet&quot;</span>)
        </span>
      </p>
      <p className="mt-1.5 flex gap-2">
        <span className="text-[#d84315]">Out[5]:</span>
        <span className="flex-1 space-y-1 pt-1">
          <span className="block h-1.5 w-full bg-[#e8e8e8]" />
          <span className="block h-1.5 w-2/3 bg-[#e8e8e8]" />
        </span>
      </p>
      <p className="mt-1.5 flex gap-2">
        <span className="text-[#303f9f]">In [ ]:</span>
        <span className="h-4 flex-1 rounded-sm border border-[#e0e0e0] bg-[#f7f7f7]" />
      </p>
    </div>
  );
}

function ChatPreview() {
  return (
    <div className="chat-backdrop flex h-full flex-col justify-center gap-2 px-3">
      <div className="ml-auto h-4 w-1/2 rounded-full bg-[#2a2a33]" />
      <div className="flex gap-2">
        <span className="size-4 shrink-0 rounded-full bg-[#9085e9]" />
        <div className="flex-1 space-y-1.5 rounded-xl rounded-tl-sm border border-white/[0.08] bg-[#16161c] p-2">
          <span className="block h-1.5 w-1/2 rounded-full bg-white/70" />
          <span className="block h-1.5 w-full rounded-full bg-white/20" />
          <span className="block h-1.5 w-4/5 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}
