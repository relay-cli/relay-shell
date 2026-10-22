import React, {useState} from 'react';
import {Text} from 'ink';
import {render} from 'ink-testing-library';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {KeymapProvider, useKeybindings} from '../src/keys/index.js';
import {
  StatusBar,
  StatusProvider,
  StatusStore,
  useNotify,
  useStatusSegment,
} from '../src/status/index.js';
import {tick} from './helpers.js';

afterEach(() => {
  vi.useRealTimers();
});

describe('StatusStore', () => {
  it('orders segments by side, order, and mount order', () => {
    const store = new StatusStore();
    store.set('a', {text: 'first'});
    store.set('b', {text: 'edge', order: -1});
    store.set('c', {text: 'right edge', side: 'right'});
    store.set('d', {text: 'right inner', side: 'right', order: 1});
    const snapshot = store.snapshot();
    expect(snapshot.left.map((segment) => segment.text)).toEqual(['edge', 'first']);
    expect(snapshot.right.map((segment) => segment.text)).toEqual(['right inner', 'right edge']);
  });

  it('skips notifications when a segment is unchanged', () => {
    const store = new StatusStore();
    const listener = vi.fn();
    store.subscribe(listener);
    store.set('a', {text: 'same'});
    store.set('a', {text: 'same'});
    expect(listener).toHaveBeenCalledOnce();
  });

  it('expires notices and lets a new notice replace an old one', () => {
    vi.useFakeTimers();
    const store = new StatusStore();
    store.notify('Saved', {durationMs: 1000});
    vi.advanceTimersByTime(600);
    store.notify('Saved again', {tone: 'success', durationMs: 1000});
    vi.advanceTimersByTime(600);
    expect(store.snapshot().notice).toEqual({message: 'Saved again', tone: 'success'});
    vi.advanceTimersByTime(500);
    expect(store.snapshot().notice).toBeUndefined();
  });

  it('keeps a notice with no duration until it is dismissed', () => {
    vi.useFakeTimers();
    const store = new StatusStore();
    store.notify('Offline', {tone: 'danger', durationMs: 0});
    vi.advanceTimersByTime(60_000);
    expect(store.snapshot().notice?.message).toBe('Offline');
    store.dismiss();
    expect(store.snapshot().notice).toBeUndefined();
  });
});

describe('StatusBar', () => {
  it('shows published segments and removes them on unmount', async () => {
    const Publisher = ({text}: {text: string}) => {
      useStatusSegment({text});
      return null;
    };
    const view = render(
      <StatusProvider>
        <Publisher text="5 hosts" />
        <StatusBar label="HOSTS">
          <Text>12:00</Text>
        </StatusBar>
      </StatusProvider>,
    );
    await tick();
    expect(view.lastFrame()).toContain(' HOSTS  5 hosts');
    expect(view.lastFrame()).toContain('12:00');
    view.rerender(
      <StatusProvider>
        <StatusBar label="HOSTS" />
      </StatusProvider>,
    );
    await tick();
    expect(view.lastFrame()).not.toContain('5 hosts');
  });

  it('replaces the left side with a notice', async () => {
    const Saver = () => {
      const notify = useNotify();
      const [saves, setSaves] = useState(0);
      useStatusSegment({text: `${saves} saves`});
      useKeybindings([
        {
          keys: 'ctrl+s',
          run: () => {
            setSaves(saves + 1);
            notify('Saved', {tone: 'success'});
          },
        },
      ]);
      return null;
    };
    const view = render(
      <KeymapProvider>
        <StatusProvider>
          <Saver />
          <StatusBar />
        </StatusProvider>
      </KeymapProvider>,
    );
    await tick();
    expect(view.lastFrame()).toContain('0 saves');
    view.stdin.write('\u0013');
    await tick();
    expect(view.lastFrame()).toContain('Saved');
    expect(view.lastFrame()).not.toContain('1 saves');
  });
});
