import { ReactNode } from 'react';

export interface TreeNode {
  type: string;
  props: Record<string, any>;
  children?: TreeNode[];
}

export interface ComponentProps {
  children?: ReactNode;
  onAction?: (action: string, payload?: any) => void;
}

export type RegisteredComponent<P = any> = React.FC<P & ComponentProps>;
