import React from 'react';
import { cn } from '../../lib/utils';
import { type VariantProps, cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-label text-sm transition-[background-color,box-shadow,transform,opacity] duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-primary-container/50 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary:
          'liquid-btn bg-gradient-to-r from-[#4facfe] to-[#6b47ff] text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 border-0',
        secondary:
          'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 hover:-translate-y-0.5',
        tertiary:
          'text-primary bg-transparent hover:bg-surface-container-low',
        ghost:
          'bg-transparent hover:bg-white/50 text-slate-700',
      },
      size: {
        sm: 'h-8 px-3 rounded-full',
        md: 'h-10 px-5 py-2 rounded-full', // Pill shape for all main buttons

        icon: 'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
