import React from 'react';
import {Text} from 'ink';
import {render} from 'ink-testing-library';
import {describe, expect, it, vi} from 'vitest';
import {Pane, Shell, Split} from '../src/index.js';
import {tick} from './helpers.js';

const panes = (
  <Split>
    <Pane id="left" title="Left">
      <Text>left body</Text>
    </Pane>
    <Pane id="right" title="Right">
      <Text>right body</Text>
    </Pane>
  </Split>
);

describe('Shell', () => {
  it('assembles the frame, panes, status bar, and hints', async () => {
    const view = render(
      <Shell title="Inventory" width={60} height={12} initialFocus="right">
        {panes}
      </Shell>,
    );
    await tick();
    const lines = (view.lastFrame() ?? '').split('\n');
    expect(lines).toHaveLength(12);
    expect(lines[0]).toContain('Inventory');
    expect(lines.at(-2)).toMatch(/^ RIGHT/);
    expect(lines.at(-1)).toContain('Tab next pane');
    expect(lines.at(-1)).toContain('q / Ctrl+C quit');
  });

  it('calls onQuit on a custom quit key', async () => {
    const onQuit = vi.fn();
    const view = render(
      <Shell title="Inventory" width={60} height={12} quitKeys="x" onQuit={onQuit}>
        {panes}
      </Shell>,
    );
    await tick();
    view.stdin.write('q');
    await tick();
    expect(onQuit).not.toHaveBeenCalled();
    view.stdin.write('x');
    await tick();
    expect(onQuit).toHaveBeenCalledOnce();
  });

  it('derives the status label from the focused pane', async () => {
    const view = render(
      <Shell
        title="Inventory"
        width={60}
        height={12}
        statusLabel={(pane) => (pane === 'left' ? 'Browsing' : 'Reading')}
      >
        {panes}
      </Shell>,
    );
    await tick();
    expect(view.lastFrame()).toContain(' Browsing');
    view.stdin.write('\t');
    await tick();
    expect(view.lastFrame()).toContain(' Reading');
  });

  it('can leave out help and hints', async () => {
    const view = render(
      <Shell title="Inventory" width={60} height={12} helpKey={false} hints={false}>
        {panes}
      </Shell>,
    );
    await tick();
    view.stdin.write('?');
    await tick();
    expect(view.lastFrame()).not.toContain('Keyboard');
    expect(view.lastFrame()).not.toContain('Tab next pane');
  });
});
