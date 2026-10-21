import {useState} from 'react';
import {Box, Text, useApp} from 'ink';
import {ShellFrame} from '../frame/index.js';
import {HelpOverlay, KeyHints, KeymapProvider, useKeybindings} from '../keys/index.js';
import {Pane, PaneFocusProvider, Split, usePane, usePaneKeybindings} from '../panes/index.js';
import {relayTheme} from '../theme.js';
import type {ShellTheme} from '../theme.js';
import {demoHosts} from './hosts.js';
import type {DemoHost} from './hosts.js';

export interface DemoAppProps {
  theme?: ShellTheme;
  width?: number;
  height?: number;
  /** Listen for keyboard input. Disabled when printing a snapshot. */
  interactive?: boolean;
}

const statusColor = (host: DemoHost, theme: ShellTheme): string =>
  host.status === 'healthy'
    ? theme.success
    : host.status === 'degraded'
      ? theme.warning
      : theme.danger;

const HostList = ({
  selected,
  onSelect,
  theme,
}: {
  selected: number;
  onSelect: (index: number) => void;
  theme: ShellTheme;
}) => {
  const pane = usePane();
  const last = demoHosts.length - 1;
  usePaneKeybindings([
    {
      keys: ['j', 'down'],
      description: 'Next host',
      group: 'Hosts',
      run: () => onSelect(Math.min(last, selected + 1)),
    },
    {
      keys: ['k', 'up'],
      description: 'Previous host',
      group: 'Hosts',
      run: () => onSelect(Math.max(0, selected - 1)),
    },
  ]);
  return (
    <>
      {demoHosts.map((host, index) => {
        const current = index === selected;
        return (
          <Text key={host.name} wrap="truncate-end">
            <Text color={current && pane.focused ? theme.focus : theme.rule}>
              {current ? '› ' : '  '}
            </Text>
            <Text color={statusColor(host, theme)}>● </Text>
            <Text color={current ? theme.text : theme.muted}>{host.name}</Text>
          </Text>
        );
      })}
    </>
  );
};

const HostDetail = ({host, theme}: {host: DemoHost; theme: ShellTheme}) => (
  <>
    <Text bold color={theme.text}>
      {host.name}
    </Text>
    <Text color={statusColor(host, theme)}>{host.status}</Text>
    <Box marginTop={1} flexDirection="column">
      <Text color={theme.muted}>
        region <Text color={theme.text}>{host.region}</Text>
      </Text>
      <Text color={theme.muted}>
        cpu <Text color={theme.text}>{host.cpu}%</Text>
      </Text>
      <Text color={theme.muted}>
        uptime <Text color={theme.text}>{host.uptime}</Text>
      </Text>
    </Box>
  </>
);

const DemoScreen = ({theme = relayTheme, width, height}: Omit<DemoAppProps, 'interactive'>) => {
  const {exit} = useApp();
  const [help, setHelp] = useState(false);
  const [selected, setSelected] = useState(0);
  useKeybindings([
    {keys: ['q', 'ctrl+c'], description: 'Quit', group: 'Application', run: () => exit()},
    {keys: '?', description: 'Help', group: 'Application', run: () => setHelp(true)},
  ]);
  const host = demoHosts[selected] ?? demoHosts[0];
  return (
    <ShellFrame
      title="Relay Shell"
      subtitle="demo"
      theme={theme}
      {...(width === undefined ? {} : {width})}
      {...(height === undefined ? {} : {height})}
      footer={<KeyHints theme={theme} />}
    >
      <PaneFocusProvider>
        <Split direction="row">
          <Pane id="hosts" title="Hosts" detail={`${demoHosts.length}`} size={28} theme={theme}>
            <HostList selected={selected} onSelect={setSelected} theme={theme} />
          </Pane>
          <Split direction="column">
            <Pane id="detail" title="Detail" theme={theme}>
              {host === undefined ? null : <HostDetail host={host} theme={theme} />}
            </Pane>
            <Pane id="events" title="Events" size={7} theme={theme}>
              {(host?.events ?? []).map((event) => (
                <Text key={event} color={theme.muted} wrap="truncate-end">
                  {event}
                </Text>
              ))}
            </Pane>
          </Split>
        </Split>
      </PaneFocusProvider>
      {help ? (
        <Box position="absolute" top={2} left={4}>
          <HelpOverlay theme={theme} onClose={() => setHelp(false)} />
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
