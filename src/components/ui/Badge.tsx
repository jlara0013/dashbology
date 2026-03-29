import React from 'react';
import { cn } from '../../lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center justify-center font-label text-xs uppercase px-2.5 py-0.5 rounded-full whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-surface-container-highest text-slate-700',
        success: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
        warning: 'bg-secondary-fixed text-on-secondary-fixed-variant',
        danger: 'bg-red-100 text-red-800',
        primary: 'bg-primary-container/10 text-primary-container',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
