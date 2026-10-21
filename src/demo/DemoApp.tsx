import {useState} from 'react';
import {Box, Text} from 'ink';
import {useKeybindings} from '../keys/index.js';
import {Pane, Split, usePane, usePaneKeybindings} from '../panes/index.js';
import {Shell} from '../shell/index.js';
import {useNotify, useStatusSegment} from '../status/index.js';
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
      hint: false,
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

const DemoStatus = ({host}: {host: DemoHost | undefined}) => {
  const notify = useNotify();
  const down = demoHosts.filter((candidate) => candidate.status === 'down').length;
  useStatusSegment(
    host === undefined
      ? undefined
      : {
          text: `${host.name} ${host.status}`,
          tone:
            host.status === 'healthy'
              ? 'success'
              : host.status === 'degraded'
                ? 'warning'
                : 'danger',
        },
  );
  useStatusSegment({text: `${demoHosts.length} hosts`, side: 'right', order: 1});
  useStatusSegment({text: `${down} down`, side: 'right', tone: down > 0 ? 'danger' : 'neutral'});
  useKeybindings([
    {
      keys: 'r',
      description: 'Refresh',
      group: 'Application',
      run: () => notify(`Refreshed ${demoHosts.length} hosts`, {tone: 'success'}),
    },
  ]);
  return null;
};

export const DemoApp = ({theme = relayTheme, width, height, interactive = true}: DemoAppProps) => {
  const [selected, setSelected] = useState(0);
  const host = demoHosts[selected] ?? demoHosts[0];
  return (
    <Shell
      title="Relay Shell"
      subtitle="demo"
      theme={theme}
      interactive={interactive}
      {...(width === undefined ? {} : {width})}
      {...(height === undefined ? {} : {height})}
    >
      <DemoStatus host={host} />
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
    </Shell>
  );
};
