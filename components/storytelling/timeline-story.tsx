'use client';

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { useMemo, useRef } from 'react';
import type { TimelineEvent } from '@/types/timeline';
import { CinematicCard } from '@/components/ui/cinematic-card';
import { TimelineBadge } from '@/components/ui/timeline-badge';
import { AnimatedBackground } from '@/components/ui/animated-background';

interface TimelineStoryProps {
  events: TimelineEvent[];
}

const categoryVariants = {
  'Research Breakthroughs': 'research' as const,
  'Models & Architectures': 'model' as const,
  'Public Releases': 'release' as const,
  'Ethics & Policy': 'ethics' as const,
  'Hardware Advances': 'hardware' as const,
  'Companies & Investments': 'research' as const,
  'AI Tools': 'model' as const,
  'Bombshell News': 'ethics' as const,
  Agents: 'hardware' as const,
};

const STAR_COUNT = 24;
const CONNECTION_COUNT = 6;
const CODE_COUNT = 4;
const GEOMETRY_COUNT = 3;
const ORB_COUNT = 2;

export function TimelineStory({ events }: TimelineStoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(containerRef, {
    margin: '-20% 0px -20% 0px',
  });
  const shouldAnimateAmbient = inView && !reduceMotion;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reduceMotion ? 0 : -120]
  );
  const midgroundY = useTransform(
    scrollYProgress,
    [0, 1],
    [0, reduceMotion ? 0 : -70]
  );

  const starAnimations = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }).map((_, i) => ({
        size: 1 + ((i * 0.061) % 2.4),
        duration: 7 + ((i * 0.17) % 3),
        delay: (i * 0.2) % 4,
        left: (i * 3.97) % 100,
        top: (i * 5.71) % 100,
      })),
    []
  );

  const connectionAnimations = useMemo(
    () =>
      Array.from({ length: CONNECTION_COUNT }).map((_, i) => ({
        width: 45 + ((i * 10.5) % 35),
        left: 7 + i * 14,
        top: 15 + ((i * 18) % 60),
      })),
    []
  );

  const codeAnimations = useMemo(
    () =>
      Array.from({ length: CODE_COUNT }).map((_, i) => ({
        duration: 10 + ((i * 1.2) % 3),
        left: 14 + i * 18,
        top: 26 + (i % 2) * 28,
      })),
    []
  );

  return (
    <section
      ref={containerRef}
      className="relative py-32 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ y: backgroundY }}
      >
        <AnimatedBackground variant="neural" className="opacity-45" />
      </motion.div>

      {shouldAnimateAmbient ? (
        <motion.div
          className="absolute inset-0 opacity-18 pointer-events-none"
          style={{ y: midgroundY }}
        >
          <AnimatedBackground variant="dots" className="opacity-25" />
        </motion.div>
      ) : (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(5,150,105,0.08),transparent_72%)]" />
      )}

      {shouldAnimateAmbient ? (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {starAnimations.map((star, i) => (
              <motion.div
                key={`star-${i}`}
                className="absolute rounded-full"
                style={{
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  background: 'rgba(5, 150, 105, 0.34)',
                  boxShadow: `0 0 ${star.size * 1.8}px rgba(5, 150, 105, 0.25)`,
                }}
                animate={{
                  opacity: [0.1, 0.55, 0.1],
                  scale: [0.8, 1, 0.8],
                  y: [0, -50],
                }}
                transition={{
                  duration: star.duration,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: star.delay,
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0 overflow-hidden opacity-35 pointer-events-none">
            {connectionAnimations.map((connection, i) => (
              <motion.div
                key={`connection-${i}`}
                className="absolute"
                style={{
                  left: `${connection.left}%`,
                  top: `${connection.top}%`,
                  width: `${connection.width}%`,
                  height: '1.5px',
                  background:
                    'linear-gradient(90deg, transparent, rgba(5, 150, 105, 0.5), transparent)',
                  transformOrigin: 'left center',
                }}
                animate={{
                  scaleX: [0, 1, 0],
                  opacity: [0, 0.55, 0],
                }}
                transition={{
                  duration: 7 + i * 0.6,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {codeAnimations.map((code, i) => (
              <motion.div
                key={`code-${i}`}
                className="absolute text-xs font-mono text-primary/35 select-none"
                style={{
                  left: `${code.left}%`,
                  top: `${code.top}%`,
                }}
                animate={{
                  y: [-20, 18, -20],
                  opacity: [0.15, 0.45, 0.15],
                }}
                transition={{
                  duration: code.duration,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: i * 0.9,
                }}
              >
                {
                  [
                    'neural.evolve()',
                    'ai.breakthrough()',
                    'machine.learn()',
                    'pattern.recognize()',
                  ][i]
                }
              </motion.div>
            ))}
          </div>

          <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
            {Array.from({ length: GEOMETRY_COUNT }).map((_, i) => (
              <motion.div
                key={`geo-${i}`}
                className="absolute border border-primary/30"
                style={{
                  left: `${22 + i * 22}%`,
                  top: `${25 + ((i * 22) % 45)}%`,
                  width: '48px',
                  height: '48px',
                  borderRadius: i % 2 === 0 ? '50%' : '0%',
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [0.85, 1.12, 0.85],
                  opacity: [0.1, 0.32, 0.1],
                }}
                transition={{
                  duration: 20 + i * 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                  delay: i * 1.5,
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: ORB_COUNT }).map((_, i) => (
              <motion.div
                key={`orb-${i}`}
                className="absolute rounded-full bg-gradient-radial from-primary/20 via-primary/8 to-transparent blur-2xl"
                style={{
                  left: `${26 + i * 30}%`,
                  top: `${36 + ((i * 20) % 30)}%`,
                  width: '160px',
                  height: '160px',
                }}
                animate={{
                  x: [-24, 24, -24],
                  y: [-16, 16, -16],
                  scale: [0.88, 1.1, 0.88],
                  opacity: [0.08, 0.22, 0.08],
                }}
                transition={{
                  duration: 24 + i * 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: i * 2,
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(5,150,105,0.12),transparent_70%)]" />
      )}

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useTransform(
            scrollYProgress,
            [0, 0.5, 1],
            [
              'radial-gradient(circle at 30% 70%, rgba(5, 150, 105, 0.12) 0%, transparent 70%)',
              'radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.15) 0%, transparent 80%)',
              'radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.08) 0%, transparent 90%)',
            ]
          ),
        }}
      />

      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/8 to-accent/5 pointer-events-none"
        animate={
          shouldAnimateAmbient
            ? { opacity: [0.24, 0.42, 0.24] }
            : undefined
        }
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="relative">
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary/30 via-primary to-accent/30 shadow-lg shadow-primary/20"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
            viewport={{ once: true }}
            style={{ originY: 0 }}
          />

          <div className="space-y-24">
            {events.map((event, index) => (
              <TimelineEventCard
                key={`${event.year}-${event.month}-${event.title}-${index}`}
                event={event}
                index={index}
                isLeft={index % 2 === 0}
                reduceMotion={Boolean(reduceMotion)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface TimelineEventCardProps {
  event: TimelineEvent;
  index: number;
  isLeft: boolean;
  reduceMotion: boolean;
}

function TimelineEventCard({
  event,
  index,
  isLeft,
  reduceMotion,
}: TimelineEventCardProps) {
  const handleCardClick = () => {
    if (event.link) {
      window.open(event.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.article
      className={`relative flex items-center ${isLeft ? 'justify-start' : 'justify-end'} transform-gpu`}
      initial={
        reduceMotion
          ? undefined
          : { opacity: 0, y: 36, x: isLeft ? -70 : 70 }
      }
      whileInView={
        reduceMotion ? undefined : { opacity: 1, y: 0, x: 0 }
      }
      transition={{
        duration: 0.55,
        ease: 'easeOut',
        delay: Math.min(index * 0.012, 0.22),
      }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
    >
      <div className="absolute left-1/2 transform -translate-x-1/2 z-20">
        <motion.div
          className="relative"
          initial={
            reduceMotion ? undefined : { scale: 0.8, opacity: 0 }
          }
          whileInView={
            reduceMotion ? undefined : { scale: 1, opacity: 1 }
          }
          transition={{ duration: 0.25, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <div className="w-5 h-5 bg-primary rounded-full border-4 border-background shadow-xl shadow-primary/35" />
        </motion.div>
      </div>

      <div
        className={`w-full max-w-lg ${isLeft ? 'pr-12' : 'pl-12'}`}
      >
        <motion.div
          whileHover={
            reduceMotion
              ? undefined
              : {
                  y: -6,
                  rotateY: isLeft ? 2.5 : -2.5,
                  scale: 1.01,
                }
          }
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          onClick={handleCardClick}
          className={event.link ? 'cursor-pointer' : ''}
        >
          <CinematicCard
            className="relative group overflow-hidden"
            glowEffect
            hoverEffect={false}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground font-mono tracking-wider">
                  {event.month} {event.year}
                </div>
                <TimelineBadge
                  variant={
                    categoryVariants[event.category] || 'research'
                  }
                >
                  {event.category}
                </TimelineBadge>
              </div>

              <h3 className="text-2xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-300">
                {event.title}
              </h3>

              <p className="text-muted-foreground leading-relaxed text-lg">
                {event.description}
              </p>

              <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            </div>
          </CinematicCard>
        </motion.div>
      </div>
    </motion.article>
  );
}
