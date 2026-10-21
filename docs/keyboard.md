# Keybindings

Relay Shell reads the keyboard once, in `KeymapProvider`, and routes each key press through a registry of bindings. Components declare the keys they handle with `useKeybindings`; they never call Ink's `useInput` directly, so two components cannot both react to the same key by accident.

```tsx
useKeybindings([
  {keys: ['q', 'ctrl+c'], description: 'Quit', group: 'Application', run: () => exit()},
  {keys: 'ctrl+s', description: 'Save', run: save},
]);
```

## Key specs

A spec is a key name with optional modifiers joined by `+`.

| Spec                                                     | Meaning                                                    |
| -------------------------------------------------------- | ---------------------------------------------------------- |
| `q`, `?`, `/`                                            | A printable character. Letters are case-sensitive.         |
| `Q`, `shift+q`                                           | A capital letter                                           |
| `ctrl+s`, `alt+x`                                        | A modified key. `meta` and `option` are aliases for `alt`. |
| `shift+tab`                                              | A modified named key                                       |
| `up`, `down`, `left`, `right`                            | Arrow keys                                                 |
| `pageup`, `pagedown`, `home`, `end`                      | Navigation keys (`pgup` and `pgdn` also work)              |
| `enter`, `escape`, `tab`, `space`, `backspace`, `delete` | Named keys (`esc` and `return` also work)                  |

## Layers

Every set of bindings belongs to a layer. Higher layers are asked first:

| Layer     | Value | Typical use                 |
| --------- | ----- | --------------------------- |
| `global`  | 0     | Quit, help, switching views |
| `pane`    | 10    | Keys for the focused pane   |
| `overlay` | 20    | Dialogs and the help screen |

Within a layer the most recently mounted set wins. A handler that returns `false` passes the key on to the next set.

An `exclusive` set stops keys it does not handle from reaching lower layers. A `fallback` receives keys that none of its bindings matched, which is how a text field accepts typing while the application still owns `Escape` and `Enter`:

```tsx
useKeybindings([{keys: 'enter', run: submit}], {
  layer: keyLayers.pane,
  fallback: (input) => {
    setDraft((draft) => draft + input);
    return true;
  },
});
```

## Help and hints

Bindings with a `description` are listed by `HelpOverlay`, grouped by `group`, and summarized on one line by `KeyHints`. A key that a higher layer already handles is listed only once, under the binding that will receive it. Set `hint: false` on a binding to keep it in help but out of the one-line hints.
