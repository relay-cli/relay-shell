import {Box, Text, useApp, useInput} from 'ink';
import {ShellFrame} from '../frame/index.js';
import {relayTheme} from '../theme.js';
import type {ShellTheme} from '../theme.js';

export interface DemoAppProps {
  theme?: ShellTheme;
  width?: number;
  height?: number;
  /** Listen for keyboard input. Disabled when printing a snapshot. */
  interactive?: boolean;
}

export const DemoApp = ({theme = relayTheme, width, height, interactive = true}: DemoAppProps) => {
  const {exit} = useApp();
  useInput(
    (input, key) => {
      if (input === 'q' || (key.ctrl && input === 'c')) exit();
    },
    {isActive: interactive},
  );
  return (
    <ShellFrame
      title="Relay Shell"
      subtitle="demo"
      theme={theme}
      {...(width === undefined ? {} : {width})}
      {...(height === undefined ? {} : {height})}
      footer={<Text color={theme.muted}>q quit</Text>}
    >
      <Box flexGrow={1} borderStyle="round" borderColor={theme.rule} paddingX={1}>
        <Text color={theme.text}>
          The frame fills the terminal and follows it when the window is resized.
        </Text>
      </Box>
    </ShellFrame>
  );
};
