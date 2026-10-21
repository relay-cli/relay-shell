# Relay Shell

Relay Shell is a framework for full-screen terminal applications. It gives an Ink application the parts every terminal tool needs before it can show anything useful: a frame that fills the screen, split panes with focus, keybindings that follow the focused pane, and a status bar.

## Try the demo

```sh
npm install
npm run demo
```

Press `q` to quit. To print one frame without opening the interactive screen:

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

## Development

```sh
npm run check
```

Relay Shell requires Node.js 22 or newer. See [the architecture notes](./docs/architecture.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
