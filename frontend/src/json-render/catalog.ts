import { z } from 'zod';
import { TreeNode } from './types';

export interface ComponentSchema {
  name: string;
  description: string;
  props: z.ZodObject<any>;
  examples: TreeNode[];
}

export const componentSchemas: Record<string, ComponentSchema> = {
  Card: {
    name: 'Card',
    description: 'A LiquidGlass-styled card container for grouping content',
    props: z.object({
      title: z.string().optional().describe('Card title displayed at top'),
      description: z.string().optional().describe('Subtitle or description text'),
      variant: z.enum(['default', 'subtle', 'highlighted']).optional().default('default').describe('Visual style variant'),
      className: z.string().optional().describe('Additional CSS classes'),
    }),
    examples: [
      {
        type: 'Card',
        props: { title: 'Performance Summary', description: 'Your interview results' },
        children: [
          { type: 'Text', props: { content: 'Great job on your interview!', variant: 'body' } }
        ]
      }
    ]
  },

  Button: {
    name: 'Button',
    description: 'A LiquidButton-styled interactive button',
    props: z.object({
      label: z.string().describe('Button text'),
      action: z.string().optional().describe('Action identifier sent to onAction callback'),
      variant: z.enum(['primary', 'secondary', 'ghost', 'danger', 'black']).optional().default('primary'),
      size: z.enum(['sm', 'md', 'lg', 'xl']).optional().default('md'),
      disabled: z.boolean().optional().default(false),
      className: z.string().optional(),
    }),
    examples: [
      { type: 'Button', props: { label: 'Continue', action: 'continue', variant: 'primary' } },
      { type: 'Button', props: { label: 'Cancel', action: 'cancel', variant: 'ghost' } }
    ]
  },

  Text: {
    name: 'Text',
    description: 'Typography element for displaying text content',
    props: z.object({
      content: z.string().describe('The text to display'),
      variant: z.enum(['body', 'heading', 'subheading', 'caption', 'label']).optional().default('body'),
      className: z.string().optional(),
    }),
    examples: [
      { type: 'Text', props: { content: 'Analysis Report', variant: 'heading' } },
      { type: 'Text', props: { content: 'Your scores improved by 15%', variant: 'body' } }
    ]
  },

  Stack: {
    name: 'Stack',
    description: 'Flexbox layout component for vertical or horizontal stacking',
    props: z.object({
      direction: z.enum(['vertical', 'horizontal']).optional().default('vertical'),
      gap: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional().default('md'),
      align: z.enum(['start', 'center', 'end', 'stretch']).optional().default('stretch'),
      justify: z.enum(['start', 'center', 'end', 'between', 'around']).optional().default('start'),
      wrap: z.boolean().optional().default(false),
      className: z.string().optional(),
    }),
    examples: [
      {
        type: 'Stack',
        props: { direction: 'horizontal', gap: 'md', justify: 'between' },
        children: [
          { type: 'Button', props: { label: 'Back', variant: 'ghost' } },
          { type: 'Button', props: { label: 'Next', variant: 'primary' } }
        ]
      }
    ]
  },

  Grid: {
    name: 'Grid',
    description: 'CSS Grid layout component with responsive columns',
    props: z.object({
      columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(6)]).optional().default(2),
      gap: z.enum(['none', 'sm', 'md', 'lg', 'xl']).optional().default('md'),
      className: z.string().optional(),
    }),
    examples: [
      {
        type: 'Grid',
        props: { columns: 2, gap: 'lg' },
        children: [
          { type: 'Card', props: { title: 'Score 1' }, children: [] },
          { type: 'Card', props: { title: 'Score 2' }, children: [] }
        ]
      }
    ]
  },

  TranscriptSegment: {
    name: 'TranscriptSegment',
    description: 'A single turn in a conversation transcript with optional emotion data',
    props: z.object({
      role: z.enum(['user', 'agent']).describe('Speaker role'),
      message: z.string().describe('The spoken text'),
      timestamp: z.number().optional().describe('Time in seconds from start'),
      emotions: z.object({
        face: z.object({ name: z.string(), score: z.number() }).optional(),
        prosody: z.object({ name: z.string(), score: z.number() }).optional(),
      }).optional(),
      isActive: z.boolean().optional().default(false),
      isHighlighted: z.boolean().optional().default(false),
      highlightColor: z.enum(['yellow', 'green', 'blue', 'pink', 'orange']).optional().default('yellow'),
      className: z.string().optional(),
    }),
    examples: [
      {
        type: 'TranscriptSegment',
        props: {
          role: 'user',
          message: 'I led a team of 5 engineers to deliver the project.',
          timestamp: 45,
          emotions: { face: { name: 'Confidence', score: 0.82 } }
        }
      }
    ]
  },

  EmotionBadge: {
    name: 'EmotionBadge',
    description: 'Displays an emotion with score and optional progress bar',
    props: z.object({
      emotion: z.string().describe('Emotion name (e.g., Joy, Confidence)'),
      score: z.number().min(0).max(1).describe('Score between 0 and 1'),
      type: z.enum(['face', 'prosody']).optional().default('face'),
      showBar: z.boolean().optional().default(true),
      size: z.enum(['sm', 'md', 'lg']).optional().default('md'),
      className: z.string().optional(),
    }),
    examples: [
      { type: 'EmotionBadge', props: { emotion: 'Confidence', score: 0.85, type: 'face' } },
      { type: 'EmotionBadge', props: { emotion: 'Enthusiasm', score: 0.72, type: 'prosody', size: 'lg' } }
    ]
  },

  Divider: {
    name: 'Divider',
    description: 'Horizontal line separator',
    props: z.object({
      variant: z.enum(['solid', 'dashed', 'dotted']).optional().default('solid'),
      spacing: z.enum(['sm', 'md', 'lg']).optional().default('md'),
      className: z.string().optional(),
    }),
    examples: [
      { type: 'Divider', props: { spacing: 'lg' } }
    ]
  },

  Badge: {
    name: 'Badge',
    description: 'Small status indicator or label',
    props: z.object({
      label: z.string().describe('Badge text'),
      variant: z.enum(['default', 'success', 'warning', 'error', 'info']).optional().default('default'),
      size: z.enum(['sm', 'md']).optional().default('md'),
      className: z.string().optional(),
    }),
    examples: [
      { type: 'Badge', props: { label: 'Analyzed', variant: 'success' } },
      { type: 'Badge', props: { label: 'Processing', variant: 'warning', size: 'sm' } }
    ]
  },
};

// Tree node schema for validation
export const TreeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    type: z.string(),
    props: z.record(z.string(), z.any()),
    children: z.array(TreeNodeSchema).optional(),
  })
);

export function validateTree(tree: unknown): tree is TreeNode {
  return TreeNodeSchema.safeParse(tree).success;
}

export function getComponentSchema(name: string): ComponentSchema | undefined {
  return componentSchemas[name];
}

export function getComponentNames(): string[] {
  return Object.keys(componentSchemas);
}

// Generate a catalog prompt for AI usage
export function generateCatalogPrompt(): string {
  const lines: string[] = [
    '# Available Components\n',
    'The following components are available for building UI trees:\n',
  ];

  for (const [name, schema] of Object.entries(componentSchemas)) {
    lines.push(`## ${name}`);
    lines.push(schema.description);
    lines.push('\n### Props:');

    const shape = schema.props.shape;
    for (const [propName, propSchema] of Object.entries(shape)) {
      const zodSchema = propSchema as z.ZodTypeAny;
      const description = zodSchema.description || '';
      const isOptional = zodSchema.isOptional();
      lines.push(`- \`${propName}\`${isOptional ? ' (optional)' : ''}: ${description}`);
    }

    lines.push('\n### Example:');
    lines.push('```json');
    lines.push(JSON.stringify(schema.examples[0], null, 2));
    lines.push('```\n');
  }

  return lines.join('\n');
}
