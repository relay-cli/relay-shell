import React from 'react';
import {render} from 'ink-testing-library';
import {describe, expect, it} from 'vitest';
import {DemoApp} from '../src/demo/index.js';
import {tick} from './helpers.js';

describe('demonstration', () => {
  it('opens the keyboard reference over the frame', async () => {
    const view = render(<DemoApp width={80} height={24} />);
    await tick();
    view.stdin.write('?');
    await tick();
    expect(view.lastFrame()).toContain('Keyboard');
    expect(view.lastFrame()).toContain('Application');
  });

  it('moves through hosts only while the host list has focus', async () => {
    const view = render(<DemoApp width={80} height={24} />);
    await tick();
    view.stdin.write('j');
    await tick();
    expect(view.lastFrame()).toContain('› ● api-2');
    view.stdin.write('\t');
    await tick();
    view.stdin.write('j');
    await tick();
    expect(view.lastFrame()).toContain('› ● api-2');
    expect(view.lastFrame()).not.toContain('next host');
  });

  it('shows the focused pane and a refresh notice in the status bar', async () => {
    const view = render(<DemoApp width={80} height={24} />);
    await tick();
    expect(view.lastFrame()).toContain(' HOSTS  api-1 healthy');
    expect(view.lastFrame()).toContain('5 hosts · 1 down');
    view.stdin.write('	');
    await tick();
    expect(view.lastFrame()).toContain(' DETAIL ');
    view.stdin.write('r');
    await tick();
    expect(view.lastFrame()).toContain('Refreshed 5 hosts');
  });
});
