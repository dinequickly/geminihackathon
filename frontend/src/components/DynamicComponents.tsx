import React from 'react';
import {
  Info,
  Clock,
  Check,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

// --- Shared Types ---
export interface DynamicComponentProps {
  id: string;
  onChange: (value: any) => void;
  value?: any;
  [key: string]: any;
}

const panelBase =
  'rounded-2xl border border-[#f1e4d6] bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)]';
const kicker =
  'text-[11px] uppercase tracking-[0.24em] text-amber-700 font-mono';
const title = 'font-serif text-xl text-gray-900';

// --- 1. QuestionCard ---
export const QuestionCard: React.FC<
  DynamicComponentProps & { question: string }
> = ({ onChange, value, question }) => {
  return (
    <div className={panelBase}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className={kicker}>Quick check</div>
          <h3 className={`${title} mt-2`}>{question}</h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-semibold">
          Q
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onChange(true)}
          className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${
            value === true
              ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-[0_10px_20px_rgba(251,191,36,0.3)] -translate-y-0.5'
              : 'bg-white border-gray-200 text-gray-700 hover:border-amber-200 hover:bg-amber-50'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => onChange(false)}
          className={`rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${
            value === false
              ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-[0_10px_20px_rgba(251,191,36,0.3)] -translate-y-0.5'
              : 'bg-white border-gray-200 text-gray-700 hover:border-amber-200 hover:bg-amber-50'
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
};

// --- 2. MultiChoiceCard ---
export const MultiChoiceCard: React.FC<
  DynamicComponentProps & { question: string; options: string[] }
> = ({ onChange, value, question, options }) => {
  return (
    <div className={panelBase}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className={kicker}>Single pick</div>
          <h3 className={`${title} mt-2`}>{question}</h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold">
          M
        </div>
      </div>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all flex items-center gap-3 ${
              value === option
                ? 'bg-teal-50 border-teal-200 text-teal-900 shadow-[0_10px_20px_rgba(20,184,166,0.18)]'
                : 'bg-white border-gray-200 text-gray-700 hover:border-teal-200 hover:bg-teal-50/60'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                value === option
                  ? 'border-teal-500 bg-teal-500'
                  : 'border-gray-300'
              }`}
            >
              {value === option && (
                <span className="w-2 h-2 rounded-full bg-white" />
              )}
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- 3. TextInputCard ---
export const TextInputCard: React.FC<
  DynamicComponentProps & {
    label: string;
    placeholder: string;
    maxLength?: number;
  }
> = ({ onChange, value = '', label, placeholder, maxLength = 100 }) => {
  return (
    <div className={panelBase}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className={kicker}>Free response</div>
          <h3 className={`${title} mt-2`}>{label}</h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-semibold">
          T
        </div>
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-xl border border-[#f1e4d6] bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 outline-none transition"
      />
      <div className="mt-2 text-right text-xs font-semibold text-gray-500">
        {value.length} / {maxLength} characters
      </div>
    </div>
  );
};

// --- 4. SliderCard ---
export const SliderCard: React.FC<
  DynamicComponentProps & {
    label: string;
    min: number;
    max: number;
    unitLabels?: [string, string];
  }
> = ({ onChange, value, label, min, max, unitLabels }) => {
  const currentValue = value ?? Math.floor((min + max) / 2);

  return (
    <div className={panelBase}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className={kicker}>Dial it in</div>
          <h3 className={`${title} mt-2`}>{label}</h3>
        </div>
        <div className="rounded-2xl bg-amber-100 px-3 py-2 text-2xl font-semibold text-amber-800">
          {currentValue}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={currentValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-orange-500"
      />
      {unitLabels && (
        <div className="flex justify-between mt-3 text-[11px] font-semibold text-gray-500 uppercase tracking-[0.2em]">
          <span>{unitLabels[0]}</span>
          <span>{unitLabels[1]}</span>
        </div>
      )}
    </div>
  );
};

// --- 5. InfoCard ---
export const InfoCard: React.FC<{
  title: string;
  message: string;
  variant: 'info' | 'tip' | 'warning';
}> = ({ title: messageTitle, message, variant }) => {
  const styles = {
    info: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-900',
      iconBg: 'bg-sky-100',
      icon: Info,
    },
    tip: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      iconBg: 'bg-emerald-100',
      icon: Lightbulb,
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      iconBg: 'bg-amber-100',
      icon: AlertTriangle,
    },
  }[variant];

  const Icon = styles.icon;

  return (
    <div className={`rounded-2xl border ${styles.border} ${styles.bg} p-5`}>
      <div className="flex gap-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${styles.iconBg} ${styles.text}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900 mb-1">
            {messageTitle}
          </div>
          <div className="text-sm text-gray-700 leading-relaxed">{message}</div>
        </div>
      </div>
    </div>
  );
};

// --- 6. TagSelector ---
export const TagSelector: React.FC<
  DynamicComponentProps & {
    label: string;
    availableTags: string[];
    maxSelections?: number;
  }
> = ({ onChange, value = [], label, availableTags, maxSelections = 4 }) => {
  const toggleTag = (tag: string) => {
    const current = Array.isArray(value) ? value : [];
    if (current.includes(tag)) {
      onChange(current.filter((t: string) => t !== tag));
    } else if (current.length < maxSelections) {
      onChange([...current, tag]);
    }
  };

  return (
    <div className={panelBase}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className={kicker}>Pick focus</div>
          <h3 className={`${title} mt-2`}>{label}</h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-semibold">
          #
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = (value || []).includes(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-2 rounded-full border text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-[0_10px_20px_rgba(251,191,36,0.25)] -translate-y-0.5'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-amber-200 hover:bg-amber-50'
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
    </div>
  );
};

// --- 7. TimeSelector ---
export const TimeSelector: React.FC<
  DynamicComponentProps & {
    label: string;
    minMinutes?: number;
    maxMinutes?: number;
  }
> = ({
  onChange,
  value = 8,
  label,
  minMinutes = 1,
  maxMinutes = 15
}) => {
  const changeTime = (delta: number) => {
    const newVal = Math.max(
      minMinutes,
      Math.min(maxMinutes, (value || 8) + delta)
    );
    onChange(newVal);
  };

  return (
    <div className={panelBase}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className={kicker}>Duration</div>
          <h3 className={`${title} mt-2`}>{label}</h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold">
          <Clock className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-6">
        <button
          onClick={() => changeTime(-1)}
          className="w-12 h-12 rounded-full border border-gray-200 bg-white text-gray-700 text-xl font-semibold hover:border-amber-200 hover:bg-amber-50 transition"
        >
          -
        </button>
        <div className="text-center">
          <div className="text-4xl font-semibold text-amber-700">
            {value || 8}
            <span className="text-lg text-amber-400 ml-1">min</span>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-[0.24em]">
            Session length
          </div>
        </div>
        <button
          onClick={() => changeTime(1)}
          className="w-12 h-12 rounded-full border border-gray-200 bg-white text-gray-700 text-xl font-semibold hover:border-amber-200 hover:bg-amber-50 transition"
        >
          +
        </button>
      </div>
    </div>
  );
};

// --- 8. ScenarioCard ---
export const ScenarioCard: React.FC<
  DynamicComponentProps & {
    title: string;
    description: string;
    includes: string[];
  }
> = ({ onChange, value, title: cardTitle, description, includes }) => {
  return (
    <div
      onClick={() => onChange(!value)}
      className={`group relative rounded-2xl border p-6 cursor-pointer transition-all ${
        value
          ? 'border-amber-300 bg-amber-50 shadow-[0_18px_40px_rgba(251,191,36,0.15)]'
          : 'border-[#f1e4d6] bg-white/90 hover:border-amber-200 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]'
      }`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
          value ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-transparent'
        }`}
      />
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <div className={kicker}>Scenario</div>
          <h3 className="font-serif text-lg text-gray-900 mt-2">
            {cardTitle}
          </h3>
        </div>
        <div
          className={`w-7 h-7 rounded-full border flex items-center justify-center transition ${
            value ? 'bg-amber-500 border-amber-500' : 'border-gray-300'
          }`}
        >
          {value && <Check className="w-4 h-4 text-white" />}
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        {description}
      </p>
      <div className="flex flex-wrap gap-2">
        {includes.map((item) => (
          <span
            key={item}
            className="px-3 py-1 rounded-full bg-white border border-amber-100 text-xs font-semibold text-amber-800"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
