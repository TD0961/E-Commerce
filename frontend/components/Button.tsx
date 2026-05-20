import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] disabled:pointer-events-none disabled:opacity-50 active:scale-95 duration-200';
    
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md hover:shadow-primary/20 font-bold',
      secondary: 'bg-secondary text-primary hover:bg-secondary-dark/30 font-semibold',
      outline: 'border-2 border-secondary bg-transparent hover:bg-secondary hover:text-primary font-semibold',
      ghost: 'hover:bg-secondary text-text-muted hover:text-text-main font-semibold',
      danger: 'bg-red-500 text-white hover:bg-red-600 font-semibold',
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
      icon: 'h-11 w-11',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
