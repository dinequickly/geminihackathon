import { ReactNode } from 'react';

export interface StackProps {
  direction?: 'vertical' | 'horizontal';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  className?: string;
  children?: ReactNode;
}

export function Stack({
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className = '',
  children
}: StackProps) {
  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const directionClass = direction === 'horizontal' ? 'flex-row' : 'flex-col';
  const wrapClass = wrap ? 'flex-wrap' : '';

  return (
    <div className={`flex ${directionClass} ${gapClasses[gap]} ${alignClasses[align]} ${justifyClasses[justify]} ${wrapClass} ${className}`}>
      {children}
    </div>
  );
}
