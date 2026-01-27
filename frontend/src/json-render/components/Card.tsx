import { ReactNode } from 'react';
import { LiquidGlass } from '../../components/LiquidGlass';

export interface CardProps {
  title?: string;
  description?: string;
  className?: string;
  variant?: 'default' | 'subtle' | 'highlighted';
  children?: ReactNode;
}

export function Card({ title, description, className = '', variant = 'default', children }: CardProps) {
  const variantClasses = {
    default: '',
    subtle: 'bg-gray-50/50',
    highlighted: 'border-l-4 border-primary-500',
  };

  return (
    <LiquidGlass className={`p-6 ${variantClasses[variant]} ${className}`}>
      {title && (
        <h3 className="font-sans font-semibold text-xl tracking-tight text-black mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-gray-600 text-sm mb-4">{description}</p>
      )}
      {children}
    </LiquidGlass>
  );
}
