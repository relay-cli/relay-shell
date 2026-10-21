import {Text} from 'ink';
import {relayTheme} from '../theme.js';
import type {ShellTheme} from '../theme.js';
import {useKeyHints} from './react.js';

export interface KeyHintsProps {
  /** Show at most this many hints, highest layer first. */
  limit?: number;
  theme?: ShellTheme;
}

/** A single line of the most relevant bindings, such as `Tab next · q quit`. */
export const KeyHints = ({limit = 6, theme = relayTheme}: KeyHintsProps) => {
  const hints = useKeyHints().slice(0, limit);
  return (
    <Text wrap="truncate-end">
      {hints.map((hint, index) => (
        <Text key={hint.keys}>
          {index === 0 ? '' : <Text color={theme.rule}> · </Text>}
          <Text color={theme.focus}>{hint.keys}</Text>
          <Text color={theme.muted}> {hint.description.toLowerCase()}</Text>
        </Text>
      ))}
    </Text>
  );
};
