import React from 'react';
import {Text} from 'ink';
import {render} from 'ink-testing-library';
import {describe, expect, it} from 'vitest';
import {ShellFrame} from '../src/frame/index.js';

describe('ShellFrame', () => {
  it('fills the requested size with a title, body, and footer', () => {
    const view = render(
      <ShellFrame
        title="Inventory"
        subtitle="3 hosts"
        width={40}
        height={6}
        footer={<Text>q quit</Text>}
      >
        <Text>body</Text>
      </ShellFrame>,
    );
    const lines = (view.lastFrame() ?? '').split('\n');
    expect(lines).toHaveLength(6);
    expect(lines[0]).toContain('Inventory · 3 hosts');
    expect(lines[1]).toContain('body');
    expect(lines[5]).toContain('q quit');
  });

  it('truncates a title that is wider than the terminal', () => {
    const view = render(<ShellFrame title={'x'.repeat(80)} width={20} height={2} />);
    const first = (view.lastFrame() ?? '').split('\n')[0] ?? '';
    expect(first.length).toBeLessThanOrEqual(20);
  });
});
