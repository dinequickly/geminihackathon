import { ReactNode } from 'react';
import { LiquidButton } from '../../components/LiquidButton';

export interface ButtonProps {
  label: string;
  action?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'black';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  onAction?: (action: string, payload?: any) => void;
}

export function Button({
  label,
  action,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon,
  onAction
}: ButtonProps) {
  const handleClick = () => {
    if (action && onAction) {
      onAction(action, { label });
    }
  };

  return (
    <LiquidButton
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      icon={icon}
      onClick={handleClick}
    >
      {label}
    </LiquidButton>
  );
}
