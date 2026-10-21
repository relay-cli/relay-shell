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

```tsx
import {Text} from 'ink';
import {ShellFrame, runShell} from '@relay-cli/shell';

await runShell(
  <ShellFrame title="Inventory" subtitle="3 hosts">
    <Text>Hello from a full-screen application.</Text>
  </ShellFrame>,
);
```

`runShell` renders on the alternate screen, so the terminal's scrollback is restored when the application exits.

## Keybindings

Components declare the keys they handle, and Relay Shell routes each key press to the right one. Overlays sit above panes, and panes sit above application-wide keys.

```tsx
import {useApp} from 'ink';
import {KeyHints, KeymapProvider, ShellFrame, runShell, useKeybindings} from '@relay-cli/shell';

const App = () => {
  const {exit} = useApp();
  useKeybindings([{keys: ['q', 'ctrl+c'], description: 'Quit', run: () => exit()}]);
  return <ShellFrame title="Inventory" footer={<KeyHints />} />;
};

await runShell(
  <KeymapProvider>
    <App />
  </KeymapProvider>,
);
```

See [the keybinding guide](./docs/keyboard.md) for key specs, layers, and text input.

## Development

```sh
npm run check
```

Relay Shell requires Node.js 22 or newer. See [the architecture notes](./docs/architecture.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
