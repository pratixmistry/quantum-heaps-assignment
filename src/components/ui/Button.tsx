import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

const VARIANTS = {
  primary: 'bg-accent text-white hover:bg-accent/90',
  secondary: 'border border-line bg-surface text-fg hover:bg-elevated',
  ghost: 'text-fg-muted hover:bg-elevated hover:text-fg',
  danger: 'bg-red-600 text-white hover:bg-red-600/90',
} as const;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: 'sm' | 'md';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
        size === 'sm' ? 'h-8 px-3.5 text-sm' : 'h-10 px-5 text-sm',
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
});

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  size?: 'sm' | 'md';
}

/** Icon-only button. `label` is mandatory so every icon control has an accessible name. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, active, size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' ? 'size-8 [&_svg]:size-4' : 'size-10 [&_svg]:size-5',
        active ? 'bg-accent/15 text-accent' : 'text-fg-muted hover:bg-elevated hover:text-fg',
        className,
      )}
      {...props}
    />
  );
});
