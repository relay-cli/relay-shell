# Relay Shell

Relay Shell is a framework for full-screen terminal applications. It gives an Ink application the parts every terminal tool needs before it can show anything useful: a frame that fills the screen, split panes with focus, keybindings that follow the focused pane, and a status bar.

## Try the demo

```sh
npm install
npm run demo
```

Press `?` for the keyboard reference and `q` to quit. To print one frame without opening the interactive screen:

```sh
npx tsx src/cli.tsx --demo --snapshot
```

## Use it in an application

`Shell` assembles the whole frame: panes with focus, a status bar, key hints, a keyboard reference on `?`, and quitting on `q` or `Ctrl+C`.

```tsx
import {Text} from 'ink';
import {Pane, Shell, Split, runShell, usePaneKeybindings} from '@relay-cli/shell';

const HostList = () => {
  usePaneKeybindings([{keys: ['j', 'down'], description: 'Next host', run: selectNext}]);
  return <Text>api-1</Text>;
};

await runShell(
  <Shell title="Inventory" subtitle="3 hosts">
    <Split direction="row">
      <Pane id="hosts" title="Hosts" size={28}>
        <HostList />
      </Pane>
      <Pane id="detail" title="Detail">
        <Text>Select a host.</Text>
      </Pane>
    </Split>
  </Shell>,
);
```

`runShell` renders on the alternate screen, so the terminal's scrollback is restored when the application exits. Every part of `Shell` is also exported on its own; see [the API reference](./docs/api.md).

## Panes

`Split` and `Pane` divide the screen into regions. A size can be a number of cells, a percentage, or a share of the remaining space, and splits nest. Each pane can take focus, and `Tab` moves focus between them.

```tsx
<Split direction="row">
  <Pane id="hosts" title="Hosts" size={28}>
    <HostList />
  </Pane>
  <Split direction="column">
    <Pane id="detail" title="Detail">
      <HostDetail />
    </Pane>
    <Pane id="events" title="Events" size="30%">
      <Events />
    </Pane>
  </Split>
</Split>
```

See [the pane guide](./docs/panes.md) for sizes, focus order, and keys that belong to one pane.

## Status bar

Components publish short segments to the status bar, and any component can show a notice that briefly replaces them.

```tsx
const HostSummary = ({hosts}: {hosts: Host[]}) => {
  const notify = useNotify();
  useStatusSegment({text: `${hosts.length} hosts`, side: 'right'});
  useKeybindings([
    {keys: 'r', description: 'Refresh', run: () => notify('Refreshed', {tone: 'success'})},
  ]);
  return null;
};
```

See [the status bar guide](./docs/status-bar.md).

## Keybindings

Components declare the keys they handle, and Relay Shell routes each key press to the right one. Overlays sit above panes, and panes sit above application-wide keys, so the same key can mean different things in different panes.

```tsx
useKeybindings([{keys: 'ctrl+s', description: 'Save', run: save}]);
```

See [the keybinding guide](./docs/keyboard.md) for key specs, layers, and text input.

## Development

```sh
npm run check
```

Relay Shell requires Node.js 22 or newer. See [the architecture notes](./docs/architecture.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
