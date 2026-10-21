# Architecture

Relay Shell is the frame a full-screen terminal application lives in. It does not draw tables, charts, or forms; it gives those pieces a place on the screen and a way to receive keys.

1. `runShell` renders an application on the alternate screen and resolves when it exits.
2. `ShellFrame` sizes the application to the terminal and reserves a title row and a footer.

Layout, focus, keybindings, and the status bar are added as separate modules so an application can use only the parts it needs.
