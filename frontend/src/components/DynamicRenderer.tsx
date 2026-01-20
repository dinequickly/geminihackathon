import React, { useState } from 'react';
import * as Components from './DynamicComponents';

// Schema for the JSON tree
export interface ComponentSchema {
  type: keyof typeof Components;
  id: string; // Unique ID for binding value
  props: Record<string, any>;
  visible?: boolean; // Simple visibility flag for now (or expression logic later)
}

interface DynamicRendererProps {
  tree: ComponentSchema[];
  onValuesChange: (values: Record<string, any>) => void;
  initialValues?: Record<string, any>;
}

export const DynamicRenderer: React.FC<DynamicRendererProps> = ({ tree, onValuesChange, initialValues = {} }) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);

  const handleValueChange = (id: string, value: any) => {
    const newValues = { ...values, [id]: value };
    setValues(newValues);
    onValuesChange(newValues);
  };

  // Filter visible components (basic logic for now)
  const visibleComponents = tree.filter(comp => comp.visible !== false);

  return (
    <div className="space-y-6">
      {visibleComponents.map((component, index) => {
        const Component = Components[component.type];

        if (!Component) {
          console.warn(`Component type "${component.type}" not found in registry.`);
          return null;
        }

        return (
          <div
            key={component.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
          >
            <Component
              {...component.props}
              id={component.id}
              value={values[component.id]}
              onChange={(val: any) => handleValueChange(component.id, val)}
            />
          </div>
        );
      })}
    </div>
  );
};