'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'idle' | 'hidden' | 'shown'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setState(entry.isIntersecting ? 'shown' : 'hidden');
        if (entry.isIntersecting) observer.unobserve(el);
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hiddenClass = {
    up: 'translate-y-8 opacity-0',
    left: 'translate-y-8 opacity-0',
    right: 'translate-y-8 opacity-0',
    scale: 'scale-[0.98] opacity-0',
  }[direction];

  return (
    <div
      ref={ref}
      className={cn(
        'motion-reduce:transform-none motion-reduce:opacity-100',
        state !== 'idle' && 'transition-all duration-700 ease-out',
        state === 'hidden' && hiddenClass,
        state === 'shown' && 'translate-x-0 translate-y-0 scale-100 opacity-100',
        className
      )}
      style={state === 'shown' ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
