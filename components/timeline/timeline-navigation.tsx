'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface TimelineNavigationSection {
  id: string;
  label: string;
  subtitle: string;
  chapter: string;
}

interface TimelineNavigationProps {
  sections: TimelineNavigationSection[];
  className?: string;
}

const DESKTOP_NAV_STEP = 60;

function formatIndex(value: number) {
  return value.toString().padStart(2, '0');
}

export function TimelineNavigation({
  sections,
  className,
}: TimelineNavigationProps) {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (!sections.length) {
      return;
    }

    setActiveId((currentActiveId) => {
      if (
        currentActiveId &&
        sections.some((section) => section.id === currentActiveId)
      ) {
        return currentActiveId;
      }

      return sections[0].id;
    });
  }, [sections]);

  useEffect(() => {
    if (!sections.length) {
      return;
    }

    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!sectionElements.length) {
      return;
    }

    let frameId = 0;

    const updateActiveSection = () => {
      frameId = 0;

      const anchorY = window.innerHeight * 0.35;
      let nextActiveId = sectionElements[0].id;

      for (const element of sectionElements) {
        if (element.getBoundingClientRect().top <= anchorY) {
          nextActiveId = element.id;
          continue;
        }

        break;
      }

      setActiveId((currentActiveId) =>
        currentActiveId === nextActiveId ? currentActiveId : nextActiveId
      );
    };

    const handleViewportChange = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();

    window.addEventListener('scroll', handleViewportChange, {
      passive: true,
    });
    window.addEventListener('resize', handleViewportChange);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('scroll', handleViewportChange);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [sections]);

  const handleNavigate = (sectionId: string) => {
    const target = document.getElementById(sectionId);

    if (!target) {
      return;
    }

    setActiveId(sectionId);
    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const activeIndex = useMemo(() => {
    const index = sections.findIndex((section) => section.id === activeId);

    return index >= 0 ? index : 0;
  }, [activeId, sections]);

  const featuredId = hoveredId ?? activeId;

  const featuredIndex = useMemo(() => {
    const index = sections.findIndex((section) => section.id === featuredId);

    return index >= 0 ? index : activeIndex;
  }, [activeIndex, featuredId, sections]);

  if (!sections.length) {
    return null;
  }

  const activeSection = sections[activeIndex] ?? sections[0];
  const featuredSection = sections[featuredIndex] ?? activeSection;

  return (
    <>
      <nav
        aria-label="Timeline chapter navigation"
        className={cn(
          'fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block xl:right-8',
          className
        )}
      >
        <div className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-8 bg-[radial-gradient(circle_at_center,rgba(5,150,105,0.18),transparent_70%)] blur-3xl"
          />

          <div className="relative flex items-start gap-6">
            <div className="relative">
              <div className="mb-5 flex flex-col items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[1.4rem] border border-white/10 bg-background/40 backdrop-blur-2xl">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_16px_rgba(5,150,105,0.75)]" />
                </div>

                <div className="space-y-1 text-center">
                  <div className="text-[10px] font-mono uppercase tracking-[0.34em] text-primary/70">
                    Index
                  </div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                    {formatIndex(activeIndex + 1)} / {formatIndex(sections.length)}
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-1/2 top-[1.375rem] bottom-[1.375rem] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-border to-transparent" />
                <motion.div
                  aria-hidden="true"
                  className="absolute left-1/2 top-[1.375rem] w-px -translate-x-1/2 bg-gradient-to-b from-primary via-primary/80 to-accent/20 shadow-[0_0_18px_rgba(5,150,105,0.45)]"
                  animate={{ height: activeIndex * DESKTOP_NAV_STEP }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.35, ease: 'easeOut' }
                  }
                />

                <div className="flex flex-col gap-4">
                  {sections.map((section, index) => {
                    const isActive = section.id === activeId;

                    return (
                      <div
                        key={section.id}
                        className="group relative flex h-11 items-center justify-center"
                      >
                        {isActive ? (
                          <motion.div
                            layoutId="timeline-nav-active-aura"
                            className="absolute inset-[-0.4rem] rounded-[1.6rem] bg-[radial-gradient(circle_at_center,rgba(5,150,105,0.22),transparent_72%)] blur-xl"
                          />
                        ) : null}

                        <motion.button
                          type="button"
                          onClick={() => handleNavigate(section.id)}
                          onMouseEnter={() => setHoveredId(section.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onFocus={() => setHoveredId(section.id)}
                          onBlur={() => setHoveredId(null)}
                          aria-current={isActive ? 'location' : undefined}
                          aria-label={`${section.chapter}: ${section.label}`}
                          className={cn(
                            'relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-[1.4rem] border text-[11px] font-mono tracking-[0.24em] backdrop-blur-2xl transition-[border-color,background-color,color,box-shadow]',
                            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
                            isActive
                              ? 'border-primary/40 bg-background/72 text-foreground shadow-[0_18px_48px_-30px_rgba(5,150,105,0.85)]'
                              : 'border-white/10 bg-background/32 text-muted-foreground hover:border-primary/30 hover:bg-background/48 hover:text-foreground'
                          )}
                          whileHover={
                            reduceMotion ? undefined : { scale: 1.04 }
                          }
                          whileTap={
                            reduceMotion ? undefined : { scale: 0.97 }
                          }
                        >
                          <span className="absolute inset-0 bg-[linear-gradient(140deg,rgba(255,255,255,0.14),transparent_42%,transparent_72%,rgba(5,150,105,0.06))]" />
                          <span className="relative">
                            {formatIndex(index + 1)}
                          </span>
                          <span
                            className={cn(
                              'absolute bottom-1.5 h-1 w-1 rounded-full transition-all',
                              isActive
                                ? 'bg-primary shadow-[0_0_14px_rgba(5,150,105,0.65)]'
                                : 'bg-border group-hover:bg-primary/55'
                            )}
                          />
                        </motion.button>

                        <div className="pointer-events-none absolute right-full top-1/2 mr-4 hidden w-48 -translate-y-1/2 rounded-[1.2rem] border border-white/10 bg-background/78 px-3 py-2 opacity-0 shadow-[0_20px_50px_-34px_rgba(5,150,105,0.85)] backdrop-blur-2xl transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 2xl:hidden">
                          <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-primary/70">
                            {section.chapter}
                          </div>
                          <div className="mt-1 text-sm font-medium text-foreground">
                            {section.label}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {section.subtitle}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {featuredSection ? (
              <motion.div
                className="pointer-events-none absolute right-full top-[7.25rem] mr-6 hidden w-64 2xl:block"
                animate={{ y: featuredIndex * DESKTOP_NAV_STEP }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        type: 'spring',
                        stiffness: 320,
                        damping: 30,
                        mass: 0.9,
                      }
                }
              >
                <div className="absolute right-0 top-5 translate-x-4">
                  <span className="block h-px w-4 bg-gradient-to-r from-transparent to-primary/60" />
                </div>

                <div className="relative overflow-hidden rounded-[1.65rem] border border-white/10 bg-background/72 px-4 py-4 shadow-[0_26px_70px_-40px_rgba(5,150,105,0.85)] backdrop-blur-2xl">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.14),transparent_38%,transparent_65%,rgba(255,255,255,0.04))]" />
                  <div className="absolute inset-y-4 left-0 w-px bg-gradient-to-b from-transparent via-primary/55 to-transparent" />

                  <div className="relative pl-4">
                    <div className="text-[10px] font-mono uppercase tracking-[0.32em] text-primary/72">
                      {featuredSection.chapter}
                    </div>
                    <div className="mt-1 text-sm font-semibold leading-tight text-foreground">
                      {featuredSection.label}
                    </div>
                    <div className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {featuredSection.subtitle}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>
        </div>
      </nav>

      <nav
        aria-label="Timeline chapter navigation"
        className="fixed inset-x-0 bottom-4 z-40 px-4 lg:hidden"
      >
        <div className="mx-auto max-w-lg overflow-hidden rounded-[1.75rem] border border-white/10 bg-background/72 p-3 shadow-[0_26px_80px_-45px_rgba(5,150,105,0.85)] backdrop-blur-2xl">
          <div className="relative mb-3 overflow-hidden rounded-[1.25rem] border border-white/10 bg-background/45 px-3 py-3">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),transparent_35%,transparent_70%,rgba(255,255,255,0.03))]" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/72">
                  Current Era
                </div>
                <div className="mt-1 truncate text-sm font-medium text-foreground">
                  {activeSection.label}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {activeSection.subtitle}
                </div>
              </div>

              <div className="shrink-0 rounded-full border border-white/10 bg-background/55 px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
                {formatIndex(activeIndex + 1)} / {formatIndex(sections.length)}
              </div>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {sections.map((section, index) => {
              const isActive = section.id === activeId;

              return (
                <motion.button
                  key={section.id}
                  type="button"
                  onClick={() => handleNavigate(section.id)}
                  aria-current={isActive ? 'location' : undefined}
                  className={cn(
                    'relative min-w-[9rem] snap-start overflow-hidden rounded-[1.2rem] border px-3 py-3 text-left backdrop-blur-xl transition-[border-color,background-color,color,box-shadow]',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/40',
                    isActive
                      ? 'border-primary/40 bg-gradient-to-br from-primary/15 via-background/70 to-background/55 text-foreground shadow-[0_20px_50px_-34px_rgba(5,150,105,0.8)]'
                      : 'border-white/10 bg-background/38 text-muted-foreground'
                  )}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                >
                  <span className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.08),transparent_40%,transparent_75%,rgba(5,150,105,0.05))]" />

                  <span className="relative block">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-mono uppercase tracking-[0.24em] text-primary/72">
                        {formatIndex(index + 1)}
                      </span>
                      <span
                        className={cn(
                          'h-1.5 w-6 rounded-full transition-colors',
                          isActive ? 'bg-primary' : 'bg-border'
                        )}
                      />
                    </span>

                    <span className="mt-3 block text-sm font-medium leading-tight">
                      {section.label}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {section.subtitle}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
