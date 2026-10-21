# Changelog

## Unreleased

- Added the full-screen `ShellFrame`, the `runShell` renderer, Relay themes, and the `relay-shell` demonstration command.
- Added layered keybindings with `KeymapProvider`, `useKeybindings`, key specs, `HelpOverlay`, and `KeyHints`.
- Added `Split` and `Pane` layouts with fixed, percentage, and shared sizes, `Tab` focus movement, and keys that follow the focused pane.
- Added `StatusBar` with segments published by components, transient notices, and `StatusStore` for status from outside React.
- Added `Shell`, which assembles the frame, panes, status bar, key hints, help, and quitting, and rebuilt the demonstration on it.
