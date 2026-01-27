export interface DividerProps {
  className?: string;
  variant?: 'solid' | 'dashed' | 'dotted';
  spacing?: 'sm' | 'md' | 'lg';
}

export function Divider({
  className = '',
  variant = 'solid',
  spacing = 'md'
}: DividerProps) {
  const variantClasses = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  const spacingClasses = {
    sm: 'my-2',
    md: 'my-4',
    lg: 'my-8',
  };

  return (
    <hr className={`border-t border-gray-200 ${variantClasses[variant]} ${spacingClasses[spacing]} ${className}`} />
  );
}
