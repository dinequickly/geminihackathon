import { createElement, Fragment } from 'react';
import { TreeNode } from './types';
import { getComponent } from './registry';

export interface JsonRendererProps {
  tree: TreeNode | TreeNode[];
  onAction?: (action: string, payload?: any) => void;
  fallback?: React.ReactNode;
}

export function JsonRenderer({ tree, onAction, fallback }: JsonRendererProps): React.ReactElement {
  // Handle array of trees
  if (Array.isArray(tree)) {
    return createElement(
      Fragment,
      null,
      tree.map((node, index) => (
        <JsonRenderer key={index} tree={node} onAction={onAction} fallback={fallback} />
      ))
    );
  }

  const Component = getComponent(tree.type);

  if (!Component) {
    console.warn(`[JsonRenderer] Unknown component type: "${tree.type}"`);
    if (fallback) {
      return createElement(Fragment, null, fallback);
    }
    return createElement(
      'div',
      { className: 'text-red-500 text-sm p-2 bg-red-50 rounded' },
      `Unknown component: ${tree.type}`
    );
  }

  // Render children recursively
  const children = tree.children?.map((child, index) => (
    <JsonRenderer key={index} tree={child} onAction={onAction} fallback={fallback} />
  ));

  // Pass onAction to the component
  return createElement(Component, { ...tree.props, onAction }, children);
}

// Utility to render from JSON string
export function renderFromJson(
  jsonString: string,
  onAction?: (action: string, payload?: any) => void
): React.ReactElement | null {
  try {
    const tree = JSON.parse(jsonString) as TreeNode | TreeNode[];
    return createElement(JsonRenderer, { tree, onAction });
  } catch (error) {
    console.error('[JsonRenderer] Failed to parse JSON:', error);
    return null;
  }
}

// Utility to validate and render
export function safeRender(
  tree: unknown,
  onAction?: (action: string, payload?: any) => void
): React.ReactElement | null {
  if (!tree || typeof tree !== 'object') {
    console.error('[JsonRenderer] Invalid tree:', tree);
    return null;
  }

  if (Array.isArray(tree)) {
    return createElement(JsonRenderer, { tree: tree as TreeNode[], onAction });
  }

  if ('type' in tree && 'props' in tree) {
    return createElement(JsonRenderer, { tree: tree as TreeNode, onAction });
  }

  console.error('[JsonRenderer] Tree missing required fields:', tree);
  return null;
}
