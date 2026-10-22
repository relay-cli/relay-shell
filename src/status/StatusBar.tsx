import type {ReactNode} from 'react';
import {Box, Text} from 'ink';
import {relayTheme} from '../theme.js';
import type {ShellTheme} from '../theme.js';
import {useStatusSnapshot} from './react.js';
import type {StatusSegment, StatusTone} from './store.js';

export interface StatusBarProps {
  /** A short label at the far left, such as the current view or mode. */
  label?: string;
  /** Extra content after the right-hand segments, such as a clock. */
  children?: ReactNode;
  theme?: ShellTheme;
}

export const toneColor = (tone: StatusTone | undefined, theme: ShellTheme): string => {
  switch (tone) {
    case 'info':
      return theme.focus;
    case 'success':
      return theme.success;
    case 'warning':
      return theme.warning;
    case 'danger':
      return theme.danger;
    default:
      return theme.muted;
  }
};

const Segments = ({segments, theme}: {segments: readonly StatusSegment[]; theme: ShellTheme}) => (
  <>
    {segments.map((segment, index) => (
      <Text key={`${index}:${segment.text}`}>
        {index === 0 ? '' : <Text color={theme.rule}> · </Text>}
        <Text color={toneColor(segment.tone, theme)}>{segment.text}</Text>
      </Text>
    ))}
  </>
);

/**
 * One row with a label, the segments components publish, and the latest
 * notice, which replaces the left-hand segments until it expires.
 */
export const StatusBar = ({label, children, theme = relayTheme}: StatusBarProps) => {
  const {left, right, notice} = useStatusSnapshot();
  return (
    <Box flexShrink={0} backgroundColor={theme.surface} justifyContent="space-between">
      <Box flexShrink={1} overflow="hidden">
        <Text wrap="truncate-end">
          {label === undefined ? null : (
            <Text bold color={theme.background} backgroundColor={theme.accent}>
              {` ${label} `}
            </Text>
          )}
          <Text> </Text>
          {notice === undefined ? (
            <Segments segments={left} theme={theme} />
          ) : (
            <Text color={toneColor(notice.tone, theme)}>{notice.message}</Text>
          )}
        </Text>
      </Box>
      <Box flexShrink={0}>
        <Text>
          <Segments segments={right} theme={theme} />
          {children === undefined ? null : <Text color={theme.rule}> · </Text>}
          {children}
          <Text> </Text>
        </Text>
      </Box>
    </Box>
  );
};
