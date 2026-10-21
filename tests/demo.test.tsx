import React from 'react';
import {render} from 'ink-testing-library';
import {describe, expect, it} from 'vitest';
import {DemoApp} from '../src/demo/index.js';
import {tick} from './helpers.js';

describe('demonstration', () => {
  it('opens the keyboard reference over the frame', async () => {
    const view = render(<DemoApp width={60} height={20} />);
    await tick();
    expect(view.lastFrame()).toContain('q / Ctrl+C quit');
    view.stdin.write('?');
    await tick();
    expect(view.lastFrame()).toContain('Keyboard');
    expect(view.lastFrame()).toContain('Application');
  });
});
