import {createContext, useContext} from 'react';
import type {ReactNode} from 'react';
import {Box} from 'ink';
import {sizeStyle} from './size.js';
import type {PaneSize, SplitDirection} from './size.js';

const SplitContext = createContext<SplitDirection | undefined>(undefined);

/** The direction of the nearest enclosing split, if any. */
export const useSplitDirection = (): SplitDirection | undefined => useContext(SplitContext);

export interface SplitProps {
  /** `row` places children side by side; `column` stacks them. */
  direction?: SplitDirection;
  /** This split's own size when it is nested inside another split. */
  size?: PaneSize;
  minSize?: number;
  /** Empty cells between children. */
  gap?: number;
  children?: ReactNode;
}

/** Divides its space between panes or nested splits according to their `size`. */
export const Split = ({direction = 'row', size, minSize, gap = 0, children}: SplitProps) => {
  const parent = useSplitDirection();
  const style =
    parent === undefined ? {flexGrow: 1, flexShrink: 1} : sizeStyle(size, parent, minSize);
  return (
    <Box {...style} flexDirection={direction} gap={gap} overflow="hidden">
      <SplitContext.Provider value={direction}>{children}</SplitContext.Provider>
    </Box>
  );
};
