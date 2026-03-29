import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ className, glass = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-all duration-300 ease-out',
        glass
          ? 'bg-white/40 backdrop-blur-[20px] border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)]'
          : 'bg-surface-container-lowest',
        className
      )}
      {...props}
    />
  );
}
