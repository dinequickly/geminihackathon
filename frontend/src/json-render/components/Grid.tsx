import { ReactNode } from 'react';

export interface GridProps {
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: ReactNode;
}

export function Grid({
  columns = 2,
  gap = 'md',
  className = '',
  children
}: GridProps) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
  };

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}
