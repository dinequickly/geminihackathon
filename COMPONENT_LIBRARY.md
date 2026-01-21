# InterviewPro Component Library

Complete design system and component documentation for the interview preparation platform.

---

## 🎨 Dynamic JSON-Rendered Components (Interview Setup Stage)

These components are rendered dynamically from JSON in the interview setup flow.

### 1. **QuestionCard**
**Purpose**: Binary yes/no questions with a playful Q icon
**Visual**: Card with gradient purple background, large Q icon, two buttons (Yes/No)
**Behavior**: User clicks Yes or No, selected button gets elevated with shadow
**Use Case**: "Do you want behavioral questions?", "Focus on technical depth?"
**Color**: Primary (purple/pink gradient)

### 2. **MultiChoiceCard**
**Purpose**: Single-select from multiple options with radio-style selection
**Visual**: Card with sky-blue gradient, M icon, vertical list of clickable options
**Behavior**: Click any option to select, shows filled radio button when active
**Use Case**: "What's your experience level?", "Preferred interview style?"
**Color**: Sky blue

### 3. **TextInputCard**
**Purpose**: Single-line text input with character counter
**Visual**: Card with sunshine yellow gradient, T icon, input field with live character count
**Behavior**: Type freely, shows "X / 100 characters" below input
**Use Case**: "What role are you interviewing for?", "Company name?"
**Color**: Sunshine yellow

### 4. **SliderCard**
**Purpose**: Numeric slider for ranges (e.g., difficulty, duration)
**Visual**: Card with mint green gradient, S icon, large number display, slider with custom thumb
**Behavior**: Drag slider, see number update in real-time, optional unit labels
**Use Case**: "Interview difficulty (1-10)", "Stress level simulation"
**Color**: Mint green

### 5. **InfoCard**
**Purpose**: Display contextual information, tips, or warnings
**Visual**: Colored card with icon (info/lightbulb/warning triangle), title and message
**Variants**:
  - `info` (sky blue) - informational messages
  - `tip` (mint green) - helpful suggestions
  - `warning` (sunshine yellow) - cautions or important notes
**Behavior**: Static display, no interaction
**Use Case**: "Your interview will be recorded", "Pro tip: Take a deep breath!"

### 6. **TagSelector**
**Purpose**: Multi-select tags with maximum selection limit
**Visual**: Card with coral/primary gradient, # icon, grid of tag pills
**Behavior**: Click tags to toggle, shows "3/4 selected" counter, disables when max reached
**Use Case**: "Select skill areas", "Topics you want to cover"
**Color**: Coral/Primary

### 7. **TimeSelector**
**Purpose**: Dedicated time picker with +/- buttons
**Visual**: Card with sky blue gradient, clock icon, huge time display, two round +/- buttons
**Behavior**: Click + or - to adjust, displays "8 min" in large text
**Use Case**: "Interview duration", "Time per question"
**Color**: Sky blue, Primary accent

### 8. **ScenarioCard**
**Purpose**: Selectable scenario cards with detailed descriptions
**Visual**: Large card with checkbox, title, description, and multiple tag pills showing what's included
**Behavior**: Click anywhere to toggle, shows animated top border when selected, checkbox fills
**Use Case**: "Technical deep-dive scenario", "Behavioral question pack"
**Color**: White/gray with primary accents

---

## 🎯 Core UI Components (Playful Design System)

### 9. **PlayfulButton**
**Purpose**: Primary action buttons throughout the app
**Variants**:
  - `primary` (purple) - main actions
  - `secondary` (white with border) - alternative actions
  - `sky` (blue) - info actions
  - `sunshine` (yellow) - warning/special actions
  - `mint` (green) - success actions
**Sizes**: `sm`, `md`, `lg`
**Features**: Optional icon, hover scale effect, shadow animation, disabled state
**Use Case**: "Start Interview", "Save Changes", "Next Step"

### 10. **PlayfulCard**
**Purpose**: Container for content sections with soft shadows
**Variants**: `white`, `primary`, `sky`, `sunshine`, `coral`, `mint`
**Features**: Rounded corners (3xl radius), soft shadow, optional hover scale
**Use Case**: Wrapping content sections, dashboard cards, result cards

### 11. **PlayfulCharacter**
**Purpose**: Animated emoji-style character for emotional feedback
**Emotions**: `happy`, `excited`, `calm`, `thinking`, `surprised`
**Visual**: Circular face with eyes, mouth, optional cheeks, bouncing animation
**Behavior**: Gentle bounce animation, changes expression based on emotion prop
**Use Case**: Loading states, empty states, celebration moments

### 12. **FloatingBlob**
**Purpose**: Decorative background elements with floating animation
**Sizes**: `sm`, `md`, `lg`
**Features**: Organic blob shape, opacity 30%, 8-second float animation, custom positioning
**Use Case**: Page backgrounds, hero sections, adding visual interest

### 13. **Badge**
**Purpose**: Small labels for status, categories, or highlights
**Variants**: `primary`, `sky`, `sunshine`, `mint`, `coral`
**Features**: Optional icon, rounded pill shape, colored backgrounds
**Use Case**: "NEW", "PREMIUM", skill tags, status indicators

### 14. **PlayfulInput**
**Purpose**: Text input fields with modern styling
**Features**: Optional icon on left, rounded (3xl), focus ring animation, disabled state
**Visual**: White background, gray border, purple focus state, soft shadow
**Use Case**: Email input, name fields, search bars

### 15. **PlayfulTextarea**
**Purpose**: Multi-line text input for longer content
**Features**: Rounded (3xl), focus ring, auto-resize disabled, purple focus state
**Visual**: Similar to PlayfulInput but taller
**Use Case**: Interview notes, feedback forms, descriptions

### 16. **LoadingSpinner**
**Purpose**: Loading indicator for async operations
**Sizes**: `sm`, `md`, `lg`
**Colors**: `primary`, `sky`, `sunshine`
**Visual**: Circular spinner with gradient border, rotating animation
**Use Case**: Button loading states, page transitions, API calls

### 17. **MessageBubble**
**Purpose**: Chat-style message display
**Roles**: `user` (right-aligned, purple), `assistant` (left-aligned, white)
**Features**: Rounded bubble, optional timestamp, slide-up animation
**Visual**: User messages are purple, AI messages are white with border
**Use Case**: Chat interfaces, conversation history, feedback messages

---

## 🌈 Color Palette

**Primary**: Purple/Pink gradient (`#a855f7` to `#ec4899`)
- Used for: Main actions, selected states, branding

**Sky**: Light blue (`#38bdf8`, `#7dd3fc`)
- Used for: Informational elements, secondary actions

**Sunshine**: Warm yellow (`#fbbf24`, `#fcd34d`)
- Used for: Warnings, highlights, energy

**Mint**: Fresh green (`#4ade80`, `#86efac`)
- Used for: Success states, calm elements

**Coral**: Warm pink/orange (`#fb7185`, `#f472b6`)
- Used for: Accents, selections, warmth

**Gray Scale**: White to dark gray for text and backgrounds

---

## 🎭 Animation System

### Fade In Up
```css
opacity: 0 → 1
translateY: 30px → 0
duration: 0.8s
easing: cubic-bezier(0.22, 1, 0.36, 1)
```

### Float
```css
translateY: 0 → -20px → -10px → 0
rotation: 0 → 2deg → -2deg → 0
duration: 8s
easing: ease-in-out
infinite loop
```

### Bounce Gentle
```css
Subtle up-down motion
duration: 2-3s
infinite loop
```

### Pulse Slow
```css
opacity: 0.3 → 0.5 → 0.3
scale: 1 → 1.05 → 1
duration: 8s
infinite loop
```

### Slide Up
```css
translateY: 20px → 0
opacity: 0 → 1
duration: 0.4s
```

### Scale Hover
```css
On hover: scale(1.05)
On active: scale(0.95)
duration: 0.3s
```

---

## 📐 Layout Patterns

### Grid Layout (Dynamic Renderer)
- 3-column grid on desktop (lg)
- 2-column grid on tablet (md)
- 1-column on mobile
- Auto-rows with min-content height
- Large components span 2 columns (MultiChoiceCard, ScenarioCard)

### Card Spacing
- Gap: 1.5rem (24px) between cards
- Padding: 1.5rem (24px) inside cards
- Margin: Auto-centered with max-width containers

### Animation Stagger
- Each component animates in with 50ms delay
- Creates smooth cascading effect
- Uses `animationDelay: ${index * 50}ms`

---

## 🎯 Typography

**Display Font**: `font-display` - Used for headings, large numbers, emphasis
**Body Font**: `font-sans` - Used for body text, descriptions, labels

**Sizes**:
- XL Heading: `text-5xl` (3rem)
- Large Heading: `text-3xl` (1.875rem)
- Medium Heading: `text-xl` (1.25rem)
- Body: `text-base` (1rem)
- Small: `text-sm` (0.875rem)
- Tiny: `text-xs` (0.75rem)

**Weights**:
- Black: `font-black` (900) - Large numbers, emphasis
- Bold: `font-bold` (700) - Headings, labels
- Semibold: `font-semibold` (600) - Buttons, subheadings
- Medium: `font-medium` (500) - Body emphasis
- Normal: `font-normal` (400) - Body text

---

## 🔧 Shadow System

**Soft Shadow**: Subtle elevation for cards
```css
shadow-soft: 0 2px 8px rgba(0,0,0,0.04)
shadow-soft-lg: 0 8px 24px rgba(0,0,0,0.08)
```

**Colored Shadows**: For hover states
```css
shadow-primary-500/30: Purple glow
shadow-sky-500/20: Blue glow
shadow-mint: Green glow
```

---

## 🎨 Border Radius System

- `rounded-full`: Perfect circles (9999px)
- `rounded-3xl`: Large curves (1.5rem/24px)
- `rounded-2xl`: Medium curves (1rem/16px)
- `rounded-xl`: Small curves (0.75rem/12px)
- `rounded-lg`: Subtle curves (0.5rem/8px)

---

## 📱 Responsive Breakpoints

- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3 columns)

---

## ✨ Special Features

### Glassmorphic Effects (Landing Page)
- Backdrop blur: 20-40px
- Semi-transparent white backgrounds (60-70% opacity)
- Soft borders with white/30% opacity
- Layered shadows for depth

### Interactive States
- Hover: scale(1.05), enhanced shadows
- Active: scale(0.95)
- Focus: Ring animation with brand color
- Disabled: 50% opacity, no pointer events

### Character Limits
- TextInputCard: 100 characters default
- Can be customized per component instance

### Selection Limits
- TagSelector: 4 selections default (customizable)
- Visual feedback when limit reached

---

This design system creates a cohesive, playful, and professional interface that makes interview preparation feel less intimidating and more engaging!
