'use client';

import { useEffect, useRef, useState } from 'react';

interface ParticleLoadingProps {
  text?: string;
  minHeight?: string;
}

const STATUS_LINES = [
  'Initializing combat systems...',
  'Loading arena data...',
  'Synchronizing leaderboard...',
  'Preparing battle assets...',
  'Calibrating score engine...',
  'Almost ready...',
];

export function ParticleLoading({ text = 'BATTLE ARENA', minHeight = '70vh' }: ParticleLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [segments, setSegments] = useState<boolean[]>(Array(20).fill(false));
  const [glitch, setGlitch] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const progressRef = useRef(0);

  // Detect dark/light mode
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      progressRef.current += Math.random() * 3.5 + 0.5;
      if (progressRef.current >= 100) progressRef.current = 100;
      const pct = Math.min(100, progressRef.current);
      setProgress(pct);
      const filled = Math.floor((pct / 100) * 20);
      setSegments(Array(20).fill(false).map((_, i) => i < filled));
    }, 80);

    const statusTick = setInterval(() => {
      setStatusIdx(i => (i + 1) % STATUS_LINES.length);
    }, 900);

    const glitchTick = setInterval(() => {
      if (Math.random() < 0.25) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 80);
      }
    }, 600);

    return () => {
      clearInterval(tick);
      clearInterval(statusTick);
      clearInterval(glitchTick);
    };
  }, []);

  // Theme-aware colors
  const c = {
    title:        isDark ? 'rgba(255,255,255,0.92)'   : 'rgba(15,15,15,0.9)',
    titleGlitch:  'rgba(230,0,18,0.9)',
    statusText:   isDark ? 'rgba(255,255,255,0.38)'   : 'rgba(30,30,30,0.5)',
    segEmpty:     isDark ? 'rgba(255,255,255,0.06)'   : 'rgba(0,0,0,0.08)',
    segBorder:    isDark ? 'rgba(255,255,255,0.08)'   : 'rgba(0,0,0,0.1)',
    thinBarBg:    isDark ? 'rgba(255,255,255,0.05)'   : 'rgba(0,0,0,0.07)',
    pctColor:     'rgba(230,0,18,0.9)',
    scanLine:     'rgba(230,0,18,0.2)',
    titleShadow:  isDark ? '0 0 20px rgba(230,0,18,0.3)' : '0 0 12px rgba(230,0,18,0.15)',
    pctShadow:    isDark ? '0 0 12px rgba(230,0,18,0.5)' : '0 0 8px rgba(230,0,18,0.3)',
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full overflow-hidden select-none"
      style={{ background: 'transparent', minHeight }}
    >
      {/* Corner brackets */}
      {[
        { top: '20%', left: '10%', rotate: '0deg' },
        { top: '20%', right: '10%', rotate: '90deg' },
        { bottom: '20%', left: '10%', rotate: '270deg' },
        { bottom: '20%', right: '10%', rotate: '180deg' },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{ ...pos, width: 28, height: 28, transform: `rotate(${pos.rotate})` }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              borderTop: '2px solid rgba(230,0,18,0.7)',
              borderLeft: '2px solid rgba(230,0,18,0.7)',
              boxShadow: isDark ? '0 0 8px rgba(230,0,18,0.4)' : '0 0 6px rgba(230,0,18,0.25)',
            }}
          />
        </div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md px-8">

        {/* Title */}
        <div className="text-center">
          <div
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.4em',
              color: 'rgba(230,0,18,0.7)',
              marginBottom: 6,
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            X-ARENA
          </div>
          <div
            style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: glitch ? c.titleGlitch : c.title,
              textShadow: glitch
                ? '2px 0 rgba(230,0,18,0.8), -2px 0 rgba(0,200,255,0.4)'
                : c.titleShadow,
              transition: 'color 0.05s, text-shadow 0.05s',
            }}
          >
            {text}
          </div>
        </div>

        {/* Segmented bar */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex gap-1 w-full">
            {segments.map((filled, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 10,
                  background: filled
                    ? i === segments.filter(Boolean).length - 1
                      ? isDark ? 'rgba(255,255,255,0.95)' : 'rgba(230,0,18,1)'
                      : `rgba(230, ${Math.floor((i / 20) * 30)}, 18, ${0.7 + (i / 20) * 0.3})`
                    : c.segEmpty,
                  borderRadius: 2,
                  boxShadow: filled
                    ? isDark
                      ? '0 0 8px rgba(230,0,18,0.6), 0 0 2px rgba(255,255,255,0.4)'
                      : '0 0 6px rgba(230,0,18,0.4)'
                    : 'none',
                  transition: 'background 0.1s, box-shadow 0.1s',
                  border: `1px solid ${c.segBorder}`,
                }}
              />
            ))}
          </div>

          {/* Secondary thin bar */}
          <div
            style={{
              width: '100%',
              height: 2,
              background: c.thinBarBg,
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: isDark
                  ? 'linear-gradient(90deg, rgba(230,0,18,0.4), rgba(255,80,40,0.9), rgba(255,255,255,0.7))'
                  : 'linear-gradient(90deg, rgba(230,0,18,0.5), rgba(230,0,18,1))',
                boxShadow: '0 0 6px rgba(230,0,18,0.6)',
                transition: 'width 0.1s ease',
                borderRadius: 1,
              }}
            />
          </div>
        </div>

        {/* Bottom row: status + percentage */}
        <div className="flex items-center justify-between w-full">
          <div
            style={{
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              color: c.statusText,
              textTransform: 'uppercase',
              maxWidth: 240,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {STATUS_LINES[statusIdx]}
          </div>

          <div
            style={{
              fontSize: '1.1rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: c.pctColor,
              textShadow: c.pctShadow,
              fontVariantNumeric: 'tabular-nums',
              minWidth: 52,
              textAlign: 'right',
            }}
          >
            {Math.floor(progress)}%
          </div>
        </div>

        {/* Scanning line */}
        <div
          style={{
            width: '100%',
            height: 1,
            background: c.scanLine,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '30%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(230,0,18,0.8), transparent)',
              animation: 'slideRight 1.8s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes slideRight {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
