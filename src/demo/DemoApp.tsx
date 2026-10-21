import {useState} from 'react';
import {Box, Text, useApp} from 'ink';
import {ShellFrame} from '../frame/index.js';
import {HelpOverlay, KeyHints, KeymapProvider, useKeybindings} from '../keys/index.js';
import {relayTheme} from '../theme.js';
import type {ShellTheme} from '../theme.js';

export interface DemoAppProps {
  theme?: ShellTheme;
  width?: number;
  height?: number;
  /** Listen for keyboard input. Disabled when printing a snapshot. */
  interactive?: boolean;
}

const DemoScreen = ({theme, width, height}: Omit<DemoAppProps, 'interactive'>) => {
  const {exit} = useApp();
  const [help, setHelp] = useState(false);
  const [count, setCount] = useState(0);
  useKeybindings([
    {keys: ['q', 'ctrl+c'], description: 'Quit', group: 'Application', run: () => exit()},
    {keys: '?', description: 'Help', group: 'Application', run: () => setHelp(true)},
    {keys: 'space', description: 'Count', group: 'Demo', run: () => setCount(count + 1)},
  ]);
  const colors = theme ?? relayTheme;
  return (
    <ShellFrame
      title="Relay Shell"
      subtitle="demo"
      theme={colors}
      {...(width === undefined ? {} : {width})}
      {...(height === undefined ? {} : {height})}
      footer={<KeyHints theme={colors} />}
    >
      <Box flexGrow={1} borderStyle="round" borderColor={colors.rule} paddingX={1}>
        <Box flexDirection="column">
          <Text color={colors.text}>
            The frame fills the terminal and follows it when the window is resized.
          </Text>
          <Text color={colors.muted}>Space pressed {count} times.</Text>
        </Box>
      </Box>
      {help ? (
        <Box position="absolute" top={2} left={4}>
          <HelpOverlay theme={colors} onClose={() => setHelp(false)} />
        </Box>
      ) : null}
    </ShellFrame>
  );
};

export const DemoApp = ({interactive = true, ...props}: DemoAppProps) => (
  <KeymapProvider active={interactive}>
    <DemoScreen {...props} />
  </KeymapProvider>
);
