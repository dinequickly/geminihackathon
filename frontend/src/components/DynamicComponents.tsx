import React from 'react';
import {
  Info,
  Clock,
  Check,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { PlayfulCard } from './PlayfulUI';

// --- Shared Types ---
export interface DynamicComponentProps {
  id: string;
  onChange: (value: any) => void;
  value?: any;
  [key: string]: any;
}

// --- 1. QuestionCard ---
export const QuestionCard: React.FC<DynamicComponentProps & { question: string }> = ({
  onChange, value, question
}) => {
  return (
    <PlayfulCard className="border-2 border-primary-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-lg">
          Q
        </div>
        <h3 className="font-display font-bold text-lg text-gray-900">{question}</h3>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onChange(true)}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
            value === true
              ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30 transform -translate-y-1'
              : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
            value === false
              ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30 transform -translate-y-1'
              : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
          }`}
        >
          No
        </button>
      </div>
    </PlayfulCard>
  );
};

// --- 2. MultiChoiceCard ---
export const MultiChoiceCard: React.FC<DynamicComponentProps & { question: string; options: string[] }> = ({
  onChange, value, question, options
}) => {
  return (
    <PlayfulCard className="border-2 border-sky-200" variant="sky">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center text-sky-700 font-bold text-lg">
          M
        </div>
        <h3 className="font-display font-bold text-lg text-gray-900">{question}</h3>
      </div>
      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option}
            onClick={() => onChange(option)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-3 ${
              value === option
                ? 'bg-sky-100 border-sky-500'
                : 'bg-white border-gray-200 hover:bg-sky-50 hover:border-sky-300'
            }`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              value === option ? 'border-sky-500 bg-sky-500' : 'border-gray-400'
            }`}>
              {value === option && <div className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className={`font-medium ${value === option ? 'text-sky-900' : 'text-gray-700'}`}>
              {option}
            </span>
          </div>
        ))}
      </div>
    </PlayfulCard>
  );
};

// --- 3. TextInputCard ---
export const TextInputCard: React.FC<DynamicComponentProps & { label: string; placeholder: string; maxLength?: number }> = ({
  onChange, value = '', label, placeholder, maxLength = 100
}) => {
  return (
    <PlayfulCard className="border-2 border-sunshine-200" variant="sunshine">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sunshine-100 to-sunshine-200 flex items-center justify-center text-sunshine-700 font-bold text-lg">
          T
        </div>
        <h3 className="font-display font-bold text-lg text-gray-900">{label}</h3>
      </div>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-300 focus:border-sunshine-400 focus:bg-sunshine-50 outline-none transition-all duration-200 font-sans text-lg placeholder:text-gray-400"
        />
        <div className="text-right mt-2 text-xs font-semibold text-gray-500">
          {value.length} / {maxLength} characters
        </div>
      </div>
    </PlayfulCard>
  );
};

// --- 4. SliderCard ---
export const SliderCard: React.FC<DynamicComponentProps & { label: string; min: number; max: number; unitLabels?: [string, string] }> = ({
  onChange, value, label, min, max, unitLabels
}) => {
  const currentValue = value ?? Math.floor((min + max) / 2);

  return (
    <PlayfulCard className="border-2 border-mint-200" variant="mint">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint-100 to-mint-200 flex items-center justify-center text-mint-700 font-bold text-lg">
          S
        </div>
        <h3 className="font-display font-bold text-lg text-gray-900">{label}</h3>
      </div>
      <div className="py-6 px-2">
        <div className="text-center mb-6">
          <span className="text-4xl font-display font-black text-mint-600">{currentValue}</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={currentValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-3 bg-mint-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-mint-500 [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
        />
        {unitLabels && (
          <div className="flex justify-between mt-3 text-sm font-bold text-gray-500 uppercase tracking-wide">
            <span>{unitLabels[0]}</span>
            <span>{unitLabels[1]}</span>
          </div>
        )}
      </div>
    </PlayfulCard>
  );
};

// --- 5. InfoCard ---
export const InfoCard: React.FC<{ title: string; message: string; variant: 'info' | 'tip' | 'warning' }> = ({
  title, message, variant
}) => {
  const styles = {
    info: { bg: 'bg-sky-50', border: 'border-sky-200', iconBg: 'bg-sky-200', iconColor: 'text-sky-700', Icon: Info },
    tip: { bg: 'bg-mint-50', border: 'border-mint-200', iconBg: 'bg-mint-200', iconColor: 'text-mint-700', Icon: Lightbulb },
    warning: { bg: 'bg-sunshine-50', border: 'border-sunshine-200', iconBg: 'bg-sunshine-200', iconColor: 'text-sunshine-700', Icon: AlertTriangle }
  }[variant];

  const Icon = styles.Icon;

  return (
    <div className={`p-6 rounded-2xl border-2 ${styles.bg} ${styles.border} flex gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${styles.iconBg} ${styles.iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

// --- 6. TagSelector ---
export const TagSelector: React.FC<DynamicComponentProps & { label: string; availableTags: string[]; maxSelections?: number }> = ({
  onChange, value = [], label, availableTags, maxSelections = 4
}) => {
  const toggleTag = (tag: string) => {
    const current = Array.isArray(value) ? value : [];
    if (current.includes(tag)) {
      onChange(current.filter((t: string) => t !== tag));
    } else if (current.length < maxSelections) {
      onChange([...current, tag]);
    }
  };

  return (
    <PlayfulCard className="border-2 border-primary-200" variant="primary">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary-700 font-bold text-lg">
          #
        </div>
        <h3 className="font-display font-bold text-lg text-gray-900">{label}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = (value || []).includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-full border-2 text-sm font-bold transition-all duration-200 ${
                isSelected
                  ? 'bg-coral-400 border-coral-400 text-white shadow-md transform -translate-y-0.5'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-coral-300 hover:bg-coral-50'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-right text-xs font-semibold text-gray-400">
        Selected: {(value || []).length} / {maxSelections}
      </div>
    </PlayfulCard>
  );
};

// --- 7. TimeSelector ---
export const TimeSelector: React.FC<DynamicComponentProps & { label: string; minMinutes?: number; maxMinutes?: number }> = ({
  onChange, value = 8, label, minMinutes = 1, maxMinutes = 15
}) => {
  const changeTime = (delta: number) => {
    const newVal = Math.max(minMinutes, Math.min(maxMinutes, (value || 8) + delta));
    onChange(newVal);
  };

  return (
    <PlayfulCard className="border-2 border-sky-200" variant="sky">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center text-sky-700 font-bold text-lg">
          <Clock className="w-5 h-5" />
        </div>
        <h3 className="font-display font-bold text-lg text-gray-900">{label}</h3>
      </div>
      <div className="flex flex-col items-center py-4">
        <div className="text-5xl font-display font-black text-primary-500 mb-6">
          {value || 8} <span className="text-2xl font-bold text-primary-300">min</span>
        </div>
        <div className="flex gap-6">
          <button
            onClick={() => changeTime(-1)}
            className="w-14 h-14 rounded-full border-2 border-primary-200 bg-white text-primary-500 font-bold text-2xl flex items-center justify-center hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
          >
            -
          </button>
          <button
            onClick={() => changeTime(1)}
            className="w-14 h-14 rounded-full border-2 border-primary-200 bg-white text-primary-500 font-bold text-2xl flex items-center justify-center hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
          >
            +
          </button>
        </div>
      </div>
    </PlayfulCard>
  );
};


// --- 8. ScenarioCard ---
export const ScenarioCard: React.FC<DynamicComponentProps & { title: string; description: string; includes: string[] }> = ({
  onChange, value, title, description, includes
}) => {
  return (
    <div
      onClick={() => onChange(!value)}
      className={`group relative bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all duration-300 overflow-hidden ${
        value
          ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-500/10'
          : 'border-gray-200 hover:border-primary-300 hover:shadow-md'
      }`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-coral-400 transition-transform duration-300 origin-left ${
        value ? 'scale-x-100' : 'scale-x-0'
      }`} />
      
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-display font-bold text-lg text-gray-900 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>
        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
          value ? 'bg-primary-500 border-primary-500' : 'border-gray-300'
        }`}>
          {value && <Check className="w-4 h-4 text-white stroke-[3]" />}
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
        {description}
      </p>
      
      <div className="flex flex-wrap gap-1.5">
        {includes.map((item) => (
          <span key={item} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
