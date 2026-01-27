import { ReactNode } from 'react';

export interface TextProps {
  content: string;
  variant?: 'body' | 'heading' | 'subheading' | 'caption' | 'label';
  className?: string;
  children?: ReactNode;
}

export function Text({ content, variant = 'body', className = '', children }: TextProps) {
  const variantClasses = {
    heading: 'font-sans font-semibold text-3xl tracking-tight text-black',
    subheading: 'font-sans font-medium text-xl text-gray-900',
    body: 'text-gray-700 leading-relaxed',
    caption: 'text-sm text-gray-500',
    label: 'font-mono text-xs text-gray-500 uppercase tracking-widest',
  };

  const Tag = variant === 'heading' ? 'h2' : variant === 'subheading' ? 'h3' : 'p';

  return (
    <Tag className={`${variantClasses[variant]} ${className}`}>
      {content}
      {children}
    </Tag>
  );
}
