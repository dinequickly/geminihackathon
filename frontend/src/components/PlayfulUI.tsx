import React from 'react';
import { LucideIcon } from 'lucide-react';

// Playful Button Component
interface PlayfulButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'sky' | 'sunshine' | 'mint';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function PlayfulButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  className = '',
  type = 'button'
}: PlayfulButtonProps) {
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-soft hover:shadow-soft-lg',
    secondary: 'bg-white hover:bg-gray-50 text-gray-900 shadow-soft border-2 border-gray-200',
    sky: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky',
    sunshine: 'bg-sunshine-400 hover:bg-sunshine-500 text-gray-900 shadow-sunshine',
    mint: 'bg-mint-500 hover:bg-mint-600 text-white shadow-mint',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-2xl',
    md: 'px-6 py-3 text-base rounded-3xl',
    lg: 'px-8 py-4 text-lg rounded-3xl',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        font-semibold transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        transform hover:scale-105 active:scale-95
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
}

// Playful Card Component
interface PlayfulCardProps {
  children: React.ReactNode;
  variant?: 'white' | 'sky' | 'sunshine' | 'coral' | 'mint';
  hover?: boolean;
  className?: string;
}

export function PlayfulCard({
  children,
  variant = 'white',
  hover = false,
  className = ''
}: PlayfulCardProps) {
  const variantClasses = {
    white: 'bg-white border-2 border-gray-100',
    sky: 'bg-sky-50 border-2 border-sky-200',
    sunshine: 'bg-sunshine-50 border-2 border-sunshine-200',
    coral: 'bg-coral-50 border-2 border-coral-200',
    mint: 'bg-mint-50 border-2 border-mint-200',
  };

  return (
    <div
      className={`
        ${variantClasses[variant]}
        rounded-3xl shadow-soft p-6
        transition-all duration-300
        ${hover ? 'hover:scale-105 hover:shadow-soft-lg cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Playful Character Illustration Components
interface CharacterProps {
  emotion?: 'happy' | 'excited' | 'calm' | 'thinking' | 'surprised';
  size?: number;
  className?: string;
}

export function PlayfulCharacter({ emotion = 'happy', size = 120, className = '' }: CharacterProps) {
  const emotions = {
    happy: {
      eyes: '• •',
      mouth: '◡',
      color: 'bg-sunshine-400',
      cheeks: true,
    },
    excited: {
      eyes: '✨ ✨',
      mouth: '▽',
      color: 'bg-primary-500',
      cheeks: true,
    },
    calm: {
      eyes: '◡ ◡',
      mouth: '—',
      color: 'bg-sky-400',
      cheeks: false,
    },
    thinking: {
      eyes: '◕ ◔',
      mouth: '◠',
      color: 'bg-mint-400',
      cheeks: false,
    },
    surprised: {
      eyes: '○ ○',
      mouth: '○',
      color: 'bg-coral-400',
      cheeks: true,
    },
  };

  const { eyes, mouth, color, cheeks } = emotions[emotion];

  return (
    <div
      className={`relative ${className} animate-bounce-gentle`}
      style={{ width: size, height: size }}
    >
      {/* Face */}
      <div className={`w-full h-full ${color} rounded-full shadow-soft-lg flex items-center justify-center relative`}>
        {/* Eyes */}
        <div className="text-white text-2xl font-bold tracking-wider absolute top-[35%]">
          {eyes}
        </div>

        {/* Mouth */}
        <div className="text-white text-3xl font-bold absolute top-[55%]">
          {mouth}
        </div>

        {/* Cheeks */}
        {cheeks && (
          <>
            <div className="absolute left-[15%] top-[45%] w-4 h-4 bg-white/30 rounded-full" />
            <div className="absolute right-[15%] top-[45%] w-4 h-4 bg-white/30 rounded-full" />
          </>
        )}
      </div>
    </div>
  );
}

// Floating Blob Background Component
interface FloatingBlobProps {
  color: string;
  size?: 'sm' | 'md' | 'lg';
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
  animationDelay?: string;
}

export function FloatingBlob({ color, size = 'md', position, animationDelay = '0s' }: FloatingBlobProps) {
  const sizeClasses = {
    sm: 'w-48 h-48',
    md: 'w-96 h-96',
    lg: 'w-[32rem] h-[32rem]',
  };

  return (
    <div
      className={`absolute ${sizeClasses[size]} ${color} rounded-blob opacity-30 animate-float pointer-events-none`}
      style={{
        ...position,
        animationDelay,
        animationDuration: '8s',
      }}
    />
  );
}

// Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'sky' | 'sunshine' | 'mint' | 'coral';
  icon?: LucideIcon;
}

export function Badge({ children, variant = 'primary', icon: Icon }: BadgeProps) {
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-700 border-primary-200',
    sky: 'bg-sky-100 text-sky-700 border-sky-200',
    sunshine: 'bg-sunshine-100 text-sunshine-700 border-sunshine-200',
    mint: 'bg-mint-100 text-mint-700 border-mint-200',
    coral: 'bg-coral-100 text-coral-700 border-coral-200',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1 rounded-full
        text-sm font-semibold border-2
        ${variantClasses[variant]}
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </span>
  );
}

// Input Component
interface PlayfulInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
}

export function PlayfulInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  icon: Icon,
  className = ''
}: PlayfulInputProps) {
  return (
    <div className={`relative ${className}`}>
      {Icon && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-5 py-3 rounded-3xl
          bg-white border-2 border-gray-200
          focus:border-primary-500 focus:ring-4 focus:ring-primary-100
          transition-all duration-300
          text-gray-900 placeholder-gray-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${Icon ? 'pl-12' : ''}
        `}
      />
    </div>
  );
}

// Textarea Component
interface PlayfulTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export function PlayfulTextarea({
  value,
  onChange,
  placeholder,
  disabled = false,
  rows = 3,
  className = ''
}: PlayfulTextareaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={`
        w-full px-5 py-3 rounded-3xl
        bg-white border-2 border-gray-200
        focus:border-primary-500 focus:ring-4 focus:ring-primary-100
        transition-all duration-300
        text-gray-900 placeholder-gray-400
        disabled:opacity-50 disabled:cursor-not-allowed
        resize-none
        ${className}
      `}
    />
  );
}

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'sky' | 'sunshine';
}

export function LoadingSpinner({ size = 'md', color = 'primary' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    primary: 'border-primary-500 border-t-transparent',
    sky: 'border-sky-500 border-t-transparent',
    sunshine: 'border-sunshine-500 border-t-transparent',
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`} />
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  message: string;
  role: 'user' | 'assistant';
  timestamp?: string;
}

export function MessageBubble({ message, role, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className="max-w-[75%]">
        <div
          className={`
            rounded-3xl px-5 py-3 shadow-soft
            ${isUser
              ? 'bg-primary-500 text-white rounded-br-lg'
              : 'bg-white text-gray-900 rounded-bl-lg border-2 border-gray-100'
            }
          `}
        >
          <p className="text-sm leading-relaxed">{message}</p>
        </div>
        {timestamp && (
          <p className={`text-xs text-gray-400 mt-1 px-2 ${isUser ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
