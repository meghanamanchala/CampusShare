import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm';
}

const buttonVariants: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-ink text-cream hover:bg-ink-2 shadow-soft',
  outline: 'border border-stone bg-white text-ink-2 hover:bg-stone-light',
  ghost: 'bg-transparent text-ink-2 hover:bg-stone-light',
};

const buttonSizes: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-11 px-5 text-sm',
  sm: 'h-9 px-4 text-sm',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition disabled:pointer-events-none disabled:opacity-60',
          buttonVariants[variant],
          buttonSizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };