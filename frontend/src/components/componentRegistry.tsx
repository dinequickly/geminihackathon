import React from 'react';
import * as Components from './DynamicComponents';
import type { ComponentType } from '../lib/interviewCatalog';

/**
 * Component Registry for json-render
 *
 * Maps component type names from the catalog to their React component implementations.
 * Used by json-render's Renderer to instantiate components from the UITree.
 */

// Create a component wrapper that adapts json-render's props to our component interface
function createComponentWrapper(Component: React.ComponentType<any>) {
  return function WrappedComponent(props: any) {
    const { key, onChange, value, ...componentProps } = props;

    return (
      <Component
        id={key}
        value={value}
        onChange={onChange}
        {...componentProps}
      />
    );
  };
}

// Map of component type names to React components
export const componentRegistry: Record<ComponentType, React.ComponentType<any>> = {
  QuestionCard: createComponentWrapper(Components.QuestionCard),
  MultiChoiceCard: createComponentWrapper(Components.MultiChoiceCard),
  TextInputCard: createComponentWrapper(Components.TextInputCard),
  SliderCard: createComponentWrapper(Components.SliderCard),
  InfoCard: Components.InfoCard, // InfoCard doesn't need onChange/value
  TagSelector: createComponentWrapper(Components.TagSelector),
  TimeSelector: createComponentWrapper(Components.TimeSelector),
  ScenarioCard: createComponentWrapper(Components.ScenarioCard),
};

export default componentRegistry;
