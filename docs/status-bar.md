# Status bar

`StatusBar` is one row at the bottom of the screen. Components anywhere in the application publish short segments to it, and any component can show a notice that temporarily replaces the left side.

```tsx
<StatusProvider>
  <ShellFrame title="Inventory" footer={<StatusBar label="HOSTS" />}>
    …
  </ShellFrame>
</StatusProvider>
```

## Segments

`useStatusSegment` shows a segment for as long as the component is mounted, and updates it when its text or tone changes. Pass `undefined` to hide it without unmounting.

```tsx
useStatusSegment({text: `${host.name} ${host.status}`, tone: 'warning'});
useStatusSegment({text: `${hosts.length} hosts`, side: 'right'});
```

| Field   | Meaning                                                               |
| ------- | --------------------------------------------------------------------- |
| `text`  | The segment's text                                                    |
| `side`  | `left` (default) or `right`                                           |
| `tone`  | `neutral`, `info`, `success`, `warning`, or `danger`                  |
| `order` | Lower values sit closer to the edge of the bar; ties keep mount order |

## Notices

`useNotify` returns a function that shows a message in place of the left-hand segments. A notice disappears after four seconds by default; a newer notice replaces it immediately. Pass `durationMs: 0` to keep it until `dismiss()` is called on the store.

```tsx
const notify = useNotify();
notify('Saved', {tone: 'success'});
notify('Connection lost', {tone: 'danger', durationMs: 0});
```

## Outside React

Create a `StatusStore` and pass it to `StatusProvider` to publish status from code that is not a component, such as a polling loop:

```ts
const status = new StatusStore();
setInterval(
  () => status.set('poll', {text: `checked ${new Date().toLocaleTimeString()}`, side: 'right'}),
  5000,
);
```
