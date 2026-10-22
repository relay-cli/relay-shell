# API

Everything is exported from `@relay-cli/shell`.

## Application

| Export     | Purpose                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------- |
| `Shell`    | The complete frame: keybindings, pane focus, status bar, hints, help on `?`, quit on `q` |
| `runShell` | Render on the alternate screen and resolve when the application exits                    |

### `Shell` props

| Prop              | Default            | Meaning                                               |
| ----------------- | ------------------ | ----------------------------------------------------- |
| `title`           | required           | Shown at the top left                                 |
| `subtitle`        |                    | Shown after the title                                 |
| `theme`           | `relayTheme`       | Colors for every part of the shell                    |
| `statusLabel`     | focused pane id    | A string, or a function of the focused pane id        |
| `statusRight`     |                    | Content at the right end of the status bar            |
| `initialFocus`    | first pane mounted | The pane focused first                                |
| `quitKeys`        | `['q', 'ctrl+c']`  | Keys that quit, or `false`                            |
| `onQuit`          | exit Ink           | Called on a quit key                                  |
| `helpKey`         | `'?'`              | Opens the keyboard reference, or `false`              |
| `hints`           | `true`             | Show one line of key hints under the status bar       |
| `interactive`     | `true`             | Read the keyboard; disable it to print a single frame |
| `width`, `height` | terminal size      | Fixed size, mainly for tests                          |

## Building blocks

`Shell` is assembled from parts that can also be used on their own.

| Area        | Exports                                                                                                                                   | Guide                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Frame       | `ShellFrame`                                                                                                                              | [architecture](./architecture.md) |
| Keybindings | `KeymapProvider`, `useKeybindings`, `useKeyHints`, `KeyHints`, `HelpOverlay`, `KeyRegistry`, `keyLayers`, `parseKeySpec`, `formatKeySpec` | [keybindings](./keyboard.md)      |
| Panes       | `PaneFocusProvider`, `Split`, `Pane`, `usePane`, `usePaneKeybindings`, `useFocusedPane`, `usePaneFocus`                                   | [panes](./panes.md)               |
| Status bar  | `StatusProvider`, `StatusBar`, `useStatusSegment`, `useNotify`, `StatusStore`                                                             | [status bar](./status-bar.md)     |
| Themes      | `relayTheme`, `monoTheme`, `shellThemes`, `ShellTheme`                                                                                    |                                   |
