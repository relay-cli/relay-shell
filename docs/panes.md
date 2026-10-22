# Panes

A layout is a tree of `Split` elements with `Pane` leaves. A split divides its space between its children along one axis; each child says how much it wants with `size`.

```tsx
<PaneFocusProvider>
  <Split direction="row">
    <Pane id="hosts" title="Hosts" size={28}>
      …
    </Pane>
    <Split direction="column">
      <Pane id="detail" title="Detail">
        …
      </Pane>
      <Pane id="events" title="Events" size="30%">
        …
      </Pane>
    </Split>
  </Split>
</PaneFocusProvider>
```

## Sizes

| Size    | Meaning                                        |
| ------- | ---------------------------------------------- |
| `28`    | Exactly 28 cells, including the border         |
| `'30%'` | A percentage of the split                      |
| `'2fr'` | Two shares of the space left after fixed sizes |
| omitted | One share (`'1fr'`)                            |

`minSize` keeps a shared or percentage pane from shrinking below a number of cells. The outermost split fills the space it is given, normally the body of a `ShellFrame`.

## Focus

`PaneFocusProvider` tracks which pane has focus and binds `Tab` and `Shift+Tab` to move it. Panes are visited in `order`, then in the order they mounted. Pass `focusable={false}` to skip a pane, `initialFocus` to choose the first one, or `keys={false}` to bind focus movement yourself through `usePaneFocus()`.

The focused pane draws its border and title in the theme's focus color. Components inside a pane read its state with `usePane()`:

```tsx
const pane = usePane();
pane.focused; // true while this pane has focus
pane.focus(); // take focus
```

## Pane keys

`usePaneKeybindings` registers bindings on the pane layer that are active only while the enclosing pane has focus. The same key can mean different things in different panes, and help lists only the keys that the focused pane will receive.

```tsx
usePaneKeybindings([
  {keys: ['j', 'down'], description: 'Next host', run: () => select(selected + 1)},
]);
```
