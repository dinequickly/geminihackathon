import { z } from 'zod';
import { createCatalog } from '@json-render/core';

/**
 * Interview Component Catalog
 *
 * Defines all available components that Claude can generate for the pre-interview configuration flow.
 * Each component has a Zod schema for type-safe validation.
 */

// 1. QuestionCard - Yes/No binary choice
const QuestionCardProps = z.object({
  question: z.string().min(5).describe('The question text to display'),
  default: z.boolean().nullable().default(null).describe('Default answer (true=Yes, false=No)')
});

// 2. MultiChoiceCard - Single selection from multiple options
const MultiChoiceCardProps = z.object({
  question: z.string().min(5).describe('The question text to display'),
  options: z.array(z.string()).min(2).max(6).describe('List of options for the user to choose from'),
  default: z.string().nullable().default(null).describe('Default selected option')
});

// 3. TextInputCard - Free-form text input
const TextInputCardProps = z.object({
  label: z.string().min(3).describe('Label for the text input'),
  placeholder: z.string().describe('Placeholder text shown in the input'),
  maxLength: z.number().int().positive().max(500).default(100).describe('Maximum character length'),
  default: z.string().default('').describe('Default value')
});

// 4. SliderCard - Numeric range selection
const SliderCardProps = z.object({
  label: z.string().min(3).describe('Label for the slider'),
  min: z.number().int().positive().describe('Minimum value'),
  max: z.number().int().positive().describe('Maximum value'),
  unitLabels: z.tuple([z.string(), z.string()]).nullable().default(null).describe('Labels for min and max (e.g., ["Easy", "Expert"])'),
  default: z.number().int().nullable().default(null).describe('Default slider value')
}).refine(data => data.max > data.min, {
  message: 'Max must be greater than min'
});

// 5. InfoCard - Informational message display (non-interactive)
const InfoCardProps = z.object({
  title: z.string().min(3).describe('Title of the info card'),
  message: z.string().min(10).describe('Informational message to display'),
  variant: z.enum(['info', 'tip', 'warning']).default('info').describe('Visual style variant')
});

// 6. TagSelector - Multi-select tags with limit
const TagSelectorProps = z.object({
  label: z.string().min(3).describe('Label for the tag selector'),
  availableTags: z.array(z.string()).min(2).max(20).describe('List of tags available for selection'),
  maxSelections: z.number().int().positive().max(10).default(4).describe('Maximum number of tags user can select'),
  default: z.array(z.string()).default([]).describe('Default selected tags')
});

// 7. TimeSelector - Duration/time selection
const TimeSelectorProps = z.object({
  label: z.string().min(3).describe('Label for the time selector'),
  minMinutes: z.number().int().positive().default(1).describe('Minimum duration in minutes'),
  maxMinutes: z.number().int().positive().default(15).describe('Maximum duration in minutes'),
  default: z.number().int().positive().default(8).describe('Default duration in minutes')
}).refine(data => data.maxMinutes > data.minMinutes, {
  message: 'MaxMinutes must be greater than minMinutes'
}).refine(data => data.default >= data.minMinutes && data.default <= data.maxMinutes, {
  message: 'Default must be between min and max'
});

// 8. ScenarioCard - Pre-built scenario selection
const ScenarioCardProps = z.object({
  title: z.string().min(3).describe('Title of the scenario'),
  description: z.string().min(10).describe('Description explaining what this scenario covers'),
  includes: z.array(z.string()).min(1).max(6).describe('List of features/topics included in this scenario'),
  default: z.boolean().default(false).describe('Whether this scenario is selected by default')
});

/**
 * Create the component catalog
 */
export const interviewCatalog = createCatalog({
  components: {
    QuestionCard: {
      props: QuestionCardProps,
      hasChildren: false
    },
    MultiChoiceCard: {
      props: MultiChoiceCardProps,
      hasChildren: false
    },
    TextInputCard: {
      props: TextInputCardProps,
      hasChildren: false
    },
    SliderCard: {
      props: SliderCardProps,
      hasChildren: false
    },
    InfoCard: {
      props: InfoCardProps,
      hasChildren: false
    },
    TagSelector: {
      props: TagSelectorProps,
      hasChildren: false
    },
    TimeSelector: {
      props: TimeSelectorProps,
      hasChildren: false
    },
    ScenarioCard: {
      props: ScenarioCardProps,
      hasChildren: false
    }
  },
  // No actions for minimal migration
  actions: {},
  // No custom validation functions for minimal migration
  functions: {},
  validation: 'strict' // Strict validation mode
});

// Export types inferred from catalog for use in other files
export type InterviewCatalogType = typeof interviewCatalog;
export type ComponentType = keyof InterviewCatalogType['components'];

// Export individual prop types for convenience
export type QuestionCardPropsType = z.infer<typeof QuestionCardProps>;
export type MultiChoiceCardPropsType = z.infer<typeof MultiChoiceCardProps>;
export type TextInputCardPropsType = z.infer<typeof TextInputCardProps>;
export type SliderCardPropsType = z.infer<typeof SliderCardProps>;
export type InfoCardPropsType = z.infer<typeof InfoCardProps>;
export type TagSelectorPropsType = z.infer<typeof TagSelectorProps>;
export type TimeSelectorPropsType = z.infer<typeof TimeSelectorProps>;
export type ScenarioCardPropsType = z.infer<typeof ScenarioCardProps>;

/**
 * Helper function to generate the catalog prompt for Claude
 * This will be used in the backend to instruct Claude about available components
 */
export function generateCatalogPrompt(): string {
  return `
You are generating a configuration UI for an interview preparation system.
You must ONLY use the following components:

1. **QuestionCard** - Yes/No binary choice
   Props: question (string), default (boolean | null)
   Example: { "type": "QuestionCard", "key": "feedback", "props": { "question": "Do you want feedback on body language?", "default": null } }

2. **MultiChoiceCard** - Single selection from multiple options
   Props: question (string), options (string array, 2-6 items), default (string | null)
   Example: { "type": "MultiChoiceCard", "key": "role", "props": { "question": "Target role level?", "options": ["Junior", "Mid", "Senior"], "default": null } }

3. **TextInputCard** - Free-form text input
   Props: label (string), placeholder (string), maxLength (number, max 500), default (string)
   Example: { "type": "TextInputCard", "key": "company", "props": { "label": "Company name", "placeholder": "e.g., Google", "maxLength": 100, "default": "" } }

4. **SliderCard** - Numeric range slider
   Props: label (string), min (number), max (number), unitLabels ([string, string] | null), default (number | null)
   Example: { "type": "SliderCard", "key": "difficulty", "props": { "label": "Difficulty level", "min": 1, "max": 10, "unitLabels": ["Easy", "Expert"], "default": 5 } }

5. **InfoCard** - Display information (non-interactive)
   Props: title (string), message (string), variant ("info" | "tip" | "warning")
   Example: { "type": "InfoCard", "key": "info1", "props": { "title": "Note", "message": "This session will be recorded", "variant": "info" } }

6. **TagSelector** - Multi-select tags
   Props: label (string), availableTags (string array, 2-20 items), maxSelections (number, max 10), default (string array)
   Example: { "type": "TagSelector", "key": "skills", "props": { "label": "Focus areas", "availableTags": ["JavaScript", "React", "Node.js"], "maxSelections": 4, "default": [] } }

7. **TimeSelector** - Duration selection
   Props: label (string), minMinutes (number), maxMinutes (number), default (number)
   Example: { "type": "TimeSelector", "key": "duration", "props": { "label": "Session length", "minMinutes": 1, "maxMinutes": 15, "default": 8 } }

8. **ScenarioCard** - Pre-built scenario selection
   Props: title (string), description (string), includes (string array, 1-6 items), default (boolean)
   Example: { "type": "ScenarioCard", "key": "behavioral", "props": { "title": "Behavioral Interview", "description": "Practice STAR method", "includes": ["Leadership", "Conflict"], "default": false } }

**CRITICAL RULES:**
- Each component MUST have a unique "key" field (alphanumeric, no spaces)
- Output MUST be valid JSON in this format: { "tree": { "root": "container", "elements": { "container": {...}, "component1": {...}, ... } } }
- The root element should be a container with children array listing all component keys
- Use descriptive, semantic keys (e.g., "difficulty_level", "target_role", "session_duration")
- Generate 3-8 components based on the user's intent
- Prioritize components that capture essential interview preferences
`.trim();
}
