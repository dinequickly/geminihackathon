import { ComponentType } from 'react';
import {
  Card,
  Button,
  Text,
  Stack,
  Grid,
  TranscriptSegment,
  EmotionBadge,
  Divider,
  Badge,
} from './components';

export type ComponentRegistry = Record<string, ComponentType<any>>;

export const registry: ComponentRegistry = {
  Card,
  Button,
  Text,
  Stack,
  Grid,
  TranscriptSegment,
  EmotionBadge,
  Divider,
  Badge,
};

export function getComponent(type: string): ComponentType<any> | undefined {
  return registry[type];
}

export function registerComponent(name: string, component: ComponentType<any>): void {
  registry[name] = component;
}

export function getComponentNames(): string[] {
  return Object.keys(registry);
}
