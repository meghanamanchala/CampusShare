import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-[120px] w-full resize-y rounded-xl border border-stone bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-ink-3 focus:border-ink disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };
