// Core exports
export { JsonRenderer, renderFromJson, safeRender, type JsonRendererProps } from './Renderer';
export { registry, getComponent, registerComponent, getComponentNames } from './registry';
export {
  componentSchemas,
  TreeNodeSchema,
  validateTree,
  getComponentSchema,
  getComponentNames as getCatalogComponentNames,
  generateCatalogPrompt,
  type ComponentSchema,
} from './catalog';
export type { TreeNode, ComponentProps, RegisteredComponent } from './types';

// Component exports for direct usage
export {
  Card,
  Button,
  Text,
  Stack,
  Grid,
  TranscriptSegment,
  EmotionBadge,
  Divider,
  Badge,
  type CardProps,
  type ButtonProps,
  type TextProps,
  type StackProps,
  type GridProps,
  type TranscriptSegmentProps,
  type EmotionBadgeProps,
  type DividerProps,
  type BadgeProps,
} from './components';
