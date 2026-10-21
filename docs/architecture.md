# Architecture

Relay Shell is the frame a full-screen terminal application lives in. It does not draw tables, charts, or forms; it gives those pieces a place on the screen and a way to receive keys.

1. `runShell` renders an application on the alternate screen and resolves when it exits.
2. `ShellFrame` sizes the application to the terminal and reserves a title row and a footer.
3. `KeymapProvider` reads the keyboard once and asks a `KeyRegistry` which binding should receive each key. See [keybindings](./keyboard.md).
4. `Split` and `Pane` divide the body into regions, and `PaneFocusProvider` decides which pane receives pane-layer keys. See [panes](./panes.md).

The status bar is added as a separate module. Every module can be used on its own.
