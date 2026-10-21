import {useState} from 'react';
import type {ReactNode} from 'react';
import {Box, useApp} from 'ink';
import {ShellFrame} from '../frame/index.js';
import {HelpOverlay, KeyHints, KeymapProvider, useKeybindings} from '../keys/index.js';
import type {KeyBinding} from '../keys/index.js';
import {PaneFocusProvider, useFocusedPane} from '../panes/index.js';
import {StatusBar, StatusProvider} from '../status/index.js';
import {relayTheme} from '../theme.js';
import type {ShellTheme} from '../theme.js';

export interface ShellProps {
  title: string;
  subtitle?: string;
  theme?: ShellTheme;
  /** Fixed size, mainly for tests and snapshots. Defaults to the terminal size. */
  width?: number;
  height?: number;
  /**
   * The label at the left of the status bar. Defaults to the focused pane's
   * id in capitals. Pass a function to derive it from the focused pane.
   */
  statusLabel?: string | ((focusedPane: string | undefined) => string | undefined);
  /** Content at the right end of the status bar, such as a clock. */
  statusRight?: ReactNode;
  /** The pane focused first. */
  initialFocus?: string;
  /** Keys that quit. Pass `false` to bind quitting yourself. */
  quitKeys?: string | readonly string[] | false;
  /** Called on a quit key. Defaults to exiting the Ink application. */
  onQuit?: () => void;
  /** The key that opens the keyboard reference. Pass `false` to disable it. */
  helpKey?: string | false;
  /** Show the one-line key hints under the status bar. */
  hints?: boolean;
  /** Read the keyboard. Disable it to print a single frame. */
  interactive?: boolean;
  children?: ReactNode;
}

type ChromeProps = Omit<ShellProps, 'initialFocus' | 'interactive'>;

const defaultLabel = (focused: string | undefined): string | undefined => focused?.toUpperCase();

const ShellChrome = ({
  title,
  subtitle,
  theme = relayTheme,
  width,
  height,
  statusLabel = defaultLabel,
  statusRight,
  quitKeys = ['q', 'ctrl+c'],
  onQuit,
  helpKey = '?',
  hints = true,
  children,
}: ChromeProps) => {
  const {exit} = useApp();
  const focused = useFocusedPane();
  const [help, setHelp] = useState(false);
  const bindings: KeyBinding[] = [];
  if (quitKeys !== false) {
    bindings.push({
      keys: quitKeys,
      description: 'Quit',
      group: 'Application',
      run: () => (onQuit ?? exit)(),
    });
  }
  if (helpKey !== false) {
    bindings.push({
      keys: helpKey,
      description: 'Help',
      group: 'Application',
      run: () => setHelp(true),
    });
  }
  useKeybindings(bindings);
  const label = typeof statusLabel === 'function' ? statusLabel(focused) : statusLabel;
  return (
    <ShellFrame
      title={title}
      theme={theme}
      {...(subtitle === undefined ? {} : {subtitle})}
      {...(width === undefined ? {} : {width})}
      {...(height === undefined ? {} : {height})}
      footer={
        <>
          <StatusBar theme={theme} {...(label === undefined ? {} : {label})}>
            {statusRight}
          </StatusBar>
          {hints ? <KeyHints theme={theme} /> : null}
        </>
      }
    >
      {children}
      {help ? (
        <Box position="absolute" top={1} left={2}>
          <HelpOverlay theme={theme} onClose={() => setHelp(false)} />
        </Box>
      ) : null}
    </ShellFrame>
  );
};

/**
 * A complete application frame: keybindings, pane focus, a status bar, key
 * hints, a keyboard reference on `?`, and quitting on `q` or `Ctrl+C`.
 * Children are usually a `Split` of `Pane`s.
 */
export const Shell = ({initialFocus, interactive = true, ...props}: ShellProps) => (
  <KeymapProvider active={interactive}>
    <StatusProvider>
      <PaneFocusProvider {...(initialFocus === undefined ? {} : {initialFocus})}>
        <ShellChrome {...props} />
      </PaneFocusProvider>
    </StatusProvider>
  </KeymapProvider>
);
