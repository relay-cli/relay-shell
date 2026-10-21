import {createContext, useContext} from 'react';
import type {ReactNode} from 'react';
import {Box, Text} from 'ink';
import {keyLayers, useKeybindings} from '../keys/index.js';
import type {KeyBinding, UseKeybindingsOptions} from '../keys/index.js';
import {relayTheme} from '../theme.js';
import type {ShellTheme} from '../theme.js';
import {usePaneRegistration} from './focus.js';
import {sizeStyle} from './size.js';
import type {PaneSize} from './size.js';
import {useSplitDirection} from './Split.js';

export interface PaneState {
  id: string;
  title?: string;
  focused: boolean;
  focus: () => void;
}

const PaneContext = createContext<PaneState | undefined>(undefined);

/** The pane a component is rendered in, and whether that pane has focus. */
export const usePane = (): PaneState => {
  const pane = useContext(PaneContext);
  if (pane === undefined) throw new Error('usePane must be used inside <Pane>.');
  return pane;
};

/** Bindings that are active only while the enclosing pane has focus. */
export const usePaneKeybindings = (
  bindings: readonly KeyBinding[],
  options: Omit<UseKeybindingsOptions, 'layer'> = {},
): void => {
  const pane = usePane();
  useKeybindings(bindings, {
    ...options,
    layer: keyLayers.pane,
    active: pane.focused && (options.active ?? true),
  });
};

export interface PaneProps {
  /** Stable identifier used for focus. */
  id: string;
  title?: string;
  /** Short text shown at the right of the title row, such as a count. */
  detail?: string;
  size?: PaneSize;
  minSize?: number;
  /** Panes that cannot take focus are skipped by `Tab`. */
  focusable?: boolean;
  /** Position in the focus order. Panes with equal order follow mount order. */
  order?: number;
  border?: boolean;
  theme?: ShellTheme;
  children?: ReactNode;
}

/** A bordered region of a split that can take focus and own keybindings. */
export const Pane = ({
  id,
  title,
  detail,
  size,
  minSize,
  focusable = true,
  order,
  border = true,
  theme = relayTheme,
  children,
}: PaneProps) => {
  const direction = useSplitDirection();
  const {focused, focus} = usePaneRegistration(id, {
    focusable,
    ...(order === undefined ? {} : {order}),
  });
  const style =
    direction === undefined ? {flexGrow: 1, flexShrink: 1} : sizeStyle(size, direction, minSize);
  const state: PaneState = {id, focused, focus, ...(title === undefined ? {} : {title})};
  return (
    <Box
      {...style}
      flexDirection="column"
      overflow="hidden"
      {...(border
        ? {borderStyle: 'round' as const, borderColor: focused ? theme.focus : theme.rule}
        : {})}
      paddingX={border ? 1 : 0}
    >
      {title === undefined && detail === undefined ? null : (
        <Box flexShrink={0} justifyContent="space-between">
          <Text bold={focused} color={focused ? theme.focus : theme.muted} wrap="truncate-end">
            {title ?? ''}
          </Text>
          {detail === undefined ? null : <Text color={theme.muted}>{detail}</Text>}
        </Box>
      )}
      <Box flexGrow={1} flexDirection="column" overflow="hidden">
        <PaneContext.Provider value={state}>{children}</PaneContext.Provider>
      </Box>
    </Box>
  );
};
