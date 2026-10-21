import React, {useState} from 'react';
import {Text} from 'ink';
import {render} from 'ink-testing-library';
import {describe, expect, it, vi} from 'vitest';
import {KeymapProvider} from '../src/keys/index.js';
import {
  Pane,
  PaneFocus,
  PaneFocusProvider,
  Split,
  sizeStyle,
  usePane,
  usePaneKeybindings,
} from '../src/panes/index.js';
import type {PaneFocusProviderProps} from '../src/panes/index.js';
import {tick} from './helpers.js';

describe('pane sizes', () => {
  it('maps cells, percentages, and shares onto the split axis', () => {
    expect(sizeStyle(20, 'row')).toMatchObject({width: 20, flexGrow: 0, flexShrink: 0});
    expect(sizeStyle('30%', 'column')).toMatchObject({height: '30%'});
    expect(sizeStyle('2fr', 'row', 10)).toMatchObject({flexGrow: 2, flexBasis: 0, minWidth: 10});
    expect(sizeStyle(undefined, 'row')).toMatchObject({flexGrow: 1});
  });

  it('rejects sizes it cannot place', () => {
    expect(() => sizeStyle(-1, 'row')).toThrow('Invalid pane size');
    expect(() => sizeStyle('wide' as never, 'row')).toThrow('Invalid pane size');
  });
});

describe('PaneFocus', () => {
  it('cycles in order and wraps around', () => {
    const focus = new PaneFocus();
    focus.register('b', 1);
    focus.register('a', 0);
    focus.register('c', 1);
    expect(focus.ids).toEqual(['a', 'b', 'c']);
    expect(focus.focused).toBe('b');
    focus.next();
    expect(focus.focused).toBe('c');
    focus.next();
    expect(focus.focused).toBe('a');
    focus.previous();
    expect(focus.focused).toBe('c');
  });

  it('honors an initial pane that mounts after others', () => {
    const focus = new PaneFocus('log');
    focus.register('list');
    focus.register('log');
    expect(focus.focused).toBe('log');
  });

  it('moves focus to a neighbour when the focused pane unmounts', () => {
    const focus = new PaneFocus();
    focus.register('a');
    const removeB = focus.register('b');
    focus.register('c');
    focus.focus('b');
    removeB();
    expect(focus.focused).toBe('c');
  });

  it('refuses duplicate ids', () => {
    const focus = new PaneFocus();
    focus.register('a');
    expect(() => focus.register('a')).toThrow('already mounted');
  });
});

const Label = () => {
  const pane = usePane();
  return <Text>{pane.focused ? `${pane.id} has focus` : `${pane.id} idle`}</Text>;
};

const Layout = (props: PaneFocusProviderProps) => (
  <KeymapProvider>
    <PaneFocusProvider {...props}>
      <Split direction="row">
        <Pane id="list" title="Hosts" size={24}>
          <Label />
        </Pane>
        <Split direction="column">
          <Pane id="detail" title="Detail">
            <Label />
          </Pane>
          <Pane id="log" title="Log" size={5}>
            <Label />
          </Pane>
        </Split>
      </Split>
    </PaneFocusProvider>
  </KeymapProvider>
);

describe('panes', () => {
  it('lays out nested splits within the frame', async () => {
    const view = render(<Layout />);
    await tick();
    const lines = (view.lastFrame() ?? '').split('\n');
    expect(lines[0]).toMatch(/^╭─{22}╮╭/);
    expect(lines.some((line) => line.includes('Hosts') && line.includes('Detail'))).toBe(true);
  });

  it('moves focus with Tab and Shift+Tab', async () => {
    const onFocusChange = vi.fn();
    const view = render(<Layout onFocusChange={onFocusChange} />);
    await tick();
    expect(view.lastFrame()).toContain('list has focus');
    view.stdin.write('\t');
    await tick();
    expect(view.lastFrame()).toContain('detail has focus');
    expect(view.lastFrame()).toContain('list idle');
    view.stdin.write('\u001B[Z');
    await tick();
    expect(view.lastFrame()).toContain('list has focus');
    expect(onFocusChange).toHaveBeenLastCalledWith('list');
  });

  it('sends pane keys only to the focused pane', async () => {
    const Counter = () => {
      const pane = usePane();
      const [count, setCount] = useState(0);
      usePaneKeybindings([{keys: 'j', description: 'Down', run: () => setCount(count + 1)}]);
      return (
        <Text>
          {pane.id}={count}
        </Text>
      );
    };
    const view = render(
      <KeymapProvider>
        <PaneFocusProvider initialFocus="right">
          <Split>
            <Pane id="left">
              <Counter />
            </Pane>
            <Pane id="right">
              <Counter />
            </Pane>
          </Split>
        </PaneFocusProvider>
      </KeymapProvider>,
    );
    await tick();
    view.stdin.write('j');
    await tick();
    expect(view.lastFrame()).toContain('left=0');
    expect(view.lastFrame()).toContain('right=1');
  });
});
