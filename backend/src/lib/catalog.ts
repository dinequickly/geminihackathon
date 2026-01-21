import { z } from 'zod';

/**
 * Shared Interview Component Catalog
 *
 * This catalog defines all available components that Claude can generate
 * for the pre-interview configuration flow. It mirrors the frontend catalog
 * and is used for server-side validation.
 */

// 1. QuestionCard - Yes/No binary choice
export const QuestionCardProps = z.object({
  question: z.string().min(5).describe('The question text to display'),
  default: z.boolean().nullable().default(null).describe('Default answer (true=Yes, false=No)'),
});

// 2. MultiChoiceCard - Single selection from multiple options
export const MultiChoiceCardProps = z.object({
  question: z.string().min(5).describe('The question text to display'),
  options: z
    .array(z.string())
    .min(2)
    .max(6)
    .describe('List of options for the user to choose from'),
  default: z.string().nullable().default(null).describe('Default selected option'),
});

// 3. TextInputCard - Free-form text input
export const TextInputCardProps = z.object({
  label: z.string().min(3).describe('Label for the text input'),
  placeholder: z.string().describe('Placeholder text shown in the input'),
  maxLength: z
    .number()
    .int()
    .positive()
    .max(500)
    .default(100)
    .describe('Maximum character length'),
  default: z.string().default('').describe('Default value'),
});

// 4. SliderCard - Numeric range selection
export const SliderCardProps = z
  .object({
    label: z.string().min(3).describe('Label for the slider'),
    min: z.number().int().positive().describe('Minimum value'),
    max: z.number().int().positive().describe('Maximum value'),
    unitLabels: z
      .tuple([z.string(), z.string()])
      .nullable()
      .default(null)
      .describe('Labels for min and max (e.g., ["Easy", "Expert"])'),
    default: z.number().int().nullable().default(null).describe('Default slider value'),
  })
  .refine((data) => data.max > data.min, {
    message: 'Max must be greater than min',
  });

// 5. InfoCard - Informational message display (non-interactive)
export const InfoCardProps = z.object({
  title: z.string().min(3).describe('Title of the info card'),
  message: z.string().min(10).describe('Informational message to display'),
  variant: z
    .enum(['info', 'tip', 'warning'])
    .default('info')
    .describe('Visual style variant'),
});

// 6. TagSelector - Multi-select tags with limit
export const TagSelectorProps = z.object({
  label: z.string().min(3).describe('Label for the tag selector'),
  availableTags: z
    .array(z.string())
    .min(2)
    .max(20)
    .describe('List of tags available for selection'),
  maxSelections: z
    .number()
    .int()
    .positive()
    .max(10)
    .default(4)
    .describe('Maximum number of tags user can select'),
  default: z.array(z.string()).default([]).describe('Default selected tags'),
});

// 7. TimeSelector - Duration/time selection
export const TimeSelectorProps = z
  .object({
    label: z.string().min(3).describe('Label for the time selector'),
    minMinutes: z
      .number()
      .int()
      .positive()
      .default(1)
      .describe('Minimum duration in minutes'),
    maxMinutes: z
      .number()
      .int()
      .positive()
      .default(15)
      .describe('Maximum duration in minutes'),
    default: z
      .number()
      .int()
      .positive()
      .default(8)
      .describe('Default duration in minutes'),
  })
  .refine((data) => data.maxMinutes > data.minMinutes, {
    message: 'MaxMinutes must be greater than minMinutes',
  })
  .refine((data) => data.default >= data.minMinutes && data.default <= data.maxMinutes, {
    message: 'Default must be between min and max',
  });

// 8. ScenarioCard - Pre-built scenario selection
export const ScenarioCardProps = z.object({
  title: z.string().min(3).describe('Title of the scenario'),
  description: z
    .string()
    .min(10)
    .describe('Description explaining what this scenario covers'),
  includes: z
    .array(z.string())
    .min(1)
    .max(6)
    .describe('List of features/topics included in this scenario'),
  default: z.boolean().default(false).describe('Whether this scenario is selected by default'),
});

// Map of component types to their schemas
export const ComponentSchemas = {
  QuestionCard: QuestionCardProps,
  MultiChoiceCard: MultiChoiceCardProps,
  TextInputCard: TextInputCardProps,
  SliderCard: SliderCardProps,
  InfoCard: InfoCardProps,
  TagSelector: TagSelectorProps,
  TimeSelector: TimeSelectorProps,
  ScenarioCard: ScenarioCardProps,
};

// Type for valid component names
export type ComponentType = keyof typeof ComponentSchemas;

// UIElement structure (json-render format)
export const UIElementSchema = z.object({
  key: z.string().describe('Unique identifier for this element'),
  type: z.enum([
    'QuestionCard',
    'MultiChoiceCard',
    'TextInputCard',
    'SliderCard',
    'InfoCard',
    'TagSelector',
    'TimeSelector',
    'ScenarioCard',
  ] as const),
  props: z.record(z.string(), z.any()).describe('Component props (validated separately by component schema)'),
  children: z.array(z.string()).optional().describe('Array of child element keys'),
  parentKey: z.string().nullable().optional().describe('Parent element key'),
  visible: z.boolean().optional().default(true).describe('Whether element is visible'),
});

// UITree structure
export const UITreeSchema = z.object({
  root: z.string().describe('Key of the root element'),
  elements: z
    .record(z.string(), UIElementSchema)
    .describe('Map of element keys to element definitions'),
});

// Export types
export type UIElement = z.infer<typeof UIElementSchema>;
export type UITree = z.infer<typeof UITreeSchema>;

/**
 * Validate a component's props against its schema
 *
 * @param type - Component type
 * @param props - Props to validate
 * @returns Validation result with parsed data or error
 */
export function validateComponentProps(type: ComponentType, props: any) {
  const schema = ComponentSchemas[type];
  if (!schema) {
    return {
      success: false,
      error: `Unknown component type: ${type}`,
    };
  }

  try {
    const parsed = schema.parse(props);
    return {
      success: true,
      data: parsed,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Validation failed',
      details: error.errors,
    };
  }
}

/**
 * Validate an entire UITree structure
 *
 * @param tree - The UITree to validate
 * @returns Validation result
 */
export function validateUITree(tree: any) {
  try {
    // First validate the tree structure
    const parsedTree = UITreeSchema.parse(tree);

    // Then validate each component's props
    const errors: Array<{ key: string; error: string }> = [];

    for (const [key, element] of Object.entries(parsedTree.elements)) {
      const typedElement = element as UIElement;

      // Validate component props
      const validation = validateComponentProps(typedElement.type as ComponentType, typedElement.props);
      if (!validation.success) {
        errors.push({
          key,
          error: validation.error || 'Unknown validation error',
        });
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: parsedTree,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Tree validation failed',
      details: error.errors,
    };
  }
}

/**
 * Generate the catalog prompt for Claude
 * This instructs Claude about available components and output format
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
