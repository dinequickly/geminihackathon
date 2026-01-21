import React from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  Clock, 
  Check, 
  Plus, 
  Minus
} from 'lucide-react';
// Common Icon Wrapper
const IconWrapper = ({ children, colorClass }: { children: React.ReactNode, colorClass: string }) => (
  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold ${colorClass} shadow-sm mb-4`}>
    {children}
  </div>
);

// 1. Yes/No Card
interface YesNoCardProps {
  question: string;
  onAnswer: (answer: boolean) => void;
  value?: boolean | null;
}

export function YesNoCard({ question, onAnswer, value }: YesNoCardProps) {
  return (
    <div className="bg-white rounded-3xl p-8 border-2 border-primary-100 shadow-soft hover:shadow-soft-lg transition-all duration-300">
      <IconWrapper colorClass="bg-primary-100 text-primary-600">Q</IconWrapper>
      <h3 className="text-xl font-bold text-gray-900 mb-8">{question}</h3>
      <div className="flex gap-4">
        {['Yes', 'No'].map((option) => {
          const isYes = option === 'Yes';
          const isActive = value === isYes;
          return (
            <button
              key={option}
              onClick={() => onAnswer(isYes)}
              className={`
                flex-1 py-4 rounded-2xl font-bold text-lg transition-all duration-300
                ${isActive 
                  ? 'bg-primary-500 text-white shadow-soft transform -translate-y-1' 
                  : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-primary-200'
                }
              `}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 2. Multi Choice Card
interface MultiChoiceCardProps {
  question: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function MultiChoiceCard({ question, options, value, onChange }: MultiChoiceCardProps) {
  return (
    <div className="bg-white rounded-3xl p-8 border-2 border-sky-100 shadow-sky hover:shadow-lg transition-all duration-300">
      <IconWrapper colorClass="bg-sky-100 text-sky-600">M</IconWrapper>
      <h3 className="text-xl font-bold text-gray-900 mb-6">{question}</h3>
      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = value === option;
          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className={`
                w-full p-4 rounded-xl flex items-center gap-4 text-left transition-all duration-200
                ${isSelected 
                  ? 'bg-sky-50 border-2 border-sky-500 text-sky-900' 
                  : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-sky-200'
                }
              `}
            >
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center
                ${isSelected ? 'border-sky-500 bg-sky-500' : 'border-gray-300'}
              `}>
                {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
              <span className="font-semibold">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 3. Text Input Card
interface TextInputCardProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
}

export function TextInputCard({ question, value, onChange, maxLength = 100, placeholder }: TextInputCardProps) {
  return (
    <div className="bg-white rounded-3xl p-8 border-2 border-sunshine-100 shadow-sunshine transition-all duration-300">
      <IconWrapper colorClass="bg-sunshine-100 text-sunshine-600">T</IconWrapper>
      <h3 className="text-xl font-bold text-gray-900 mb-6">{question}</h3>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:border-sunshine-400 focus:bg-white focus:outline-none transition-all font-medium text-lg"
        />
        <div className="absolute right-4 bottom-4 text-xs font-bold text-gray-400">
          {value.length} / {maxLength} characters
        </div>
      </div>
    </div>
  );
}

// 4. Slider Card
interface SliderCardProps {
  question: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function SliderCard({ question, value, onChange, min = 1, max = 10, step = 1 }: SliderCardProps) {
  return (
    <div className="bg-white rounded-3xl p-8 border-2 border-mint-100 shadow-mint transition-all duration-300">
      <IconWrapper colorClass="bg-mint-100 text-mint-600">S</IconWrapper>
      <h3 className="text-xl font-bold text-gray-900 mb-8">{question}</h3>
      
      <div className="flex flex-col items-center gap-8">
        <div className="text-6xl font-black text-mint-500 font-display">
          {value}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-4 bg-gray-100 rounded-full appearance-none cursor-pointer accent-mint-500 hover:accent-mint-600"
        />
        <div className="flex justify-between w-full text-gray-400 font-bold text-sm uppercase tracking-wider">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
}

// 5. Info Card
interface InfoCardProps {
  type: 'info' | 'tip' | 'warning';
  title: string;
  message: string;
}

export function InfoCard({ type, title, message }: InfoCardProps) {
  const styles = {
    info: {
      bg: 'bg-sky-50',
      border: 'border-sky-100',
      iconBg: 'bg-sky-100',
      text: 'text-sky-700',
      icon: Lightbulb,
      iconColor: 'text-sky-600'
    },
    tip: {
      bg: 'bg-mint-50',
      border: 'border-mint-100',
      iconBg: 'bg-mint-100',
      text: 'text-mint-700',
      icon: Lightbulb,
      iconColor: 'text-mint-600'
    },
    warning: {
      bg: 'bg-sunshine-50',
      border: 'border-sunshine-100',
      iconBg: 'bg-sunshine-100',
      text: 'text-sunshine-700',
      icon: AlertTriangle,
      iconColor: 'text-sunshine-600'
    }
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div className={`${style.bg} border-2 ${style.border} rounded-2xl p-6 flex gap-4`}>
      <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${style.iconColor}`} />
      </div>
      <div>
        <h4 className={`font-bold text-lg mb-1 ${style.text}`}>{title}</h4>
        <p className={`${style.text} opacity-90 text-sm leading-relaxed`}>{message}</p>
      </div>
    </div>
  );
}

// 6. Tag Selector
interface TagSelectorProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
}

export function TagSelector({ label, options, selected, onChange, max }: TagSelectorProps) {
  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      if (max && selected.length >= max) return;
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border-2 border-coral-100 shadow-soft transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <IconWrapper colorClass="bg-coral-100 text-coral-600">#</IconWrapper>
          <h3 className="text-xl font-bold text-gray-900">{label}</h3>
        </div>
        {max && (
          <div className="bg-coral-50 text-coral-600 px-3 py-1 rounded-full text-xs font-bold border border-coral-100">
            {selected.length}/{max} selected
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((tag) => {
          const isSelected = selected.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`
                px-4 py-2 rounded-full font-bold text-sm transition-all duration-200
                ${isSelected 
                  ? 'bg-coral-500 text-white shadow-md transform scale-105' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 7. Time Selector
interface TimeSelectorProps {
  label: string;
  value: number; // minutes
  onChange: (minutes: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function TimeSelector({ label, value, onChange, min = 5, max = 60, step = 5 }: TimeSelectorProps) {
  const adjust = (delta: number) => {
    const newValue = Math.min(Math.max(value + delta, min), max);
    onChange(newValue);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border-2 border-sky-100 shadow-sky text-center">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-4">
          <Clock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-gray-500 mb-6 uppercase tracking-wide">{label}</h3>
        
        <div className="flex items-center gap-8">
          <button 
            onClick={() => adjust(-step)}
            className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 flex items-center justify-center transition-colors"
          >
            <Minus className="w-6 h-6" />
          </button>
          
          <div className="text-5xl font-black text-sky-900 font-display min-w-[140px]">
            {value} <span className="text-2xl text-sky-400 font-bold">min</span>
          </div>

          <button 
            onClick={() => adjust(step)}
            className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 flex items-center justify-center transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 8. Scenario Card
interface ScenarioCardProps {
  title: string;
  description: string;
  tags: string[];
  selected?: boolean;
  onSelect?: () => void;
}

export function ScenarioCard({ title, description, tags, selected, onSelect }: ScenarioCardProps) {
  return (
    <div 
      onClick={onSelect}
      className={`
        relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-all duration-300 group
        bg-white border-2 
        ${selected 
          ? 'border-t-8 border-t-primary-500 border-primary-200 shadow-lg' 
          : 'border-t-8 border-t-gray-100 border-gray-100 hover:border-t-primary-300 hover:shadow-md'
        }
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`
          w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors
          ${selected ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-200 text-transparent'}
        `}>
          <Check className="w-5 h-5" />
        </div>
      </div>

      <h3 className={`text-2xl font-bold mb-3 ${selected ? 'text-primary-900' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className="text-gray-500 leading-relaxed mb-6">
        {description}
      </p>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg uppercase tracking-wide">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
