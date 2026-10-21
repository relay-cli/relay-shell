# Architecture

Relay Shell is the frame a full-screen terminal application lives in. It does not draw tables, charts, or forms; it gives those pieces a place on the screen and a way to receive keys.

1. `runShell` renders an application on the alternate screen and resolves when it exits.
2. `ShellFrame` sizes the application to the terminal and reserves a title row and a footer.
3. `KeymapProvider` reads the keyboard once and asks a `KeyRegistry` which binding should receive each key. See [keybindings](./keyboard.md).
4. `Split` and `Pane` divide the body into regions, and `PaneFocusProvider` decides which pane receives pane-layer keys. See [panes](./panes.md).
5. `StatusProvider` collects segments and notices from any component, and `StatusBar` draws them in the footer. See [the status bar](./status-bar.md).

Each provider can be used on its own; an application that only needs keybindings does not have to adopt panes.
