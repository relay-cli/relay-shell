import {Box, Text} from 'ink';
import {relayTheme} from '../theme.js';
import type {ShellTheme} from '../theme.js';
import {keyLayers} from './registry.js';
import type {ListedBinding} from './registry.js';
import {useKeyHints, useKeybindings} from './react.js';

export interface HelpOverlayProps {
  onClose: () => void;
  title?: string;
  theme?: ShellTheme;
}

const groupBindings = (bindings: readonly ListedBinding[]): Map<string, ListedBinding[]> => {
  const groups = new Map<string, ListedBinding[]>();
  for (const binding of bindings) {
    const group = binding.group ?? 'General';
    groups.set(group, [...(groups.get(group) ?? []), binding]);
  }
  return groups;
};

/**
 * Lists every advertised binding, grouped by heading. While it is open it
 * captures the keyboard; `Esc` or `?` closes it.
 */
export const HelpOverlay = ({
  onClose,
  title = 'Keyboard',
  theme = relayTheme,
}: HelpOverlayProps) => {
  const hints = useKeyHints();
  useKeybindings([{keys: ['escape', '?'], run: onClose}], {
    layer: keyLayers.overlay,
    exclusive: true,
  });
  const width = Math.max(10, ...hints.map((hint) => hint.keys.length));
  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={theme.focus}
      backgroundColor={theme.surface}
      paddingX={1}
    >
      <Text bold color={theme.text}>
        {title}
      </Text>
      {[...groupBindings(hints)].map(([group, bindings]) => (
        <Box key={group} flexDirection="column" marginTop={1}>
          <Text color={theme.accent}>{group}</Text>
          {bindings.map((binding) => (
            <Text key={binding.keys} wrap="truncate-end">
              <Text color={theme.focus}>{binding.keys.padEnd(width)}</Text>
              <Text color={theme.text}> {binding.description}</Text>
            </Text>
          ))}
        </Box>
      ))}
      <Box marginTop={1}>
        <Text color={theme.muted}>Esc close</Text>
      </Box>
    </Box>
  );
};
