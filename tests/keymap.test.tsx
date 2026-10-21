import React, {useState} from 'react';
import {Text} from 'ink';
import {render} from 'ink-testing-library';
import {describe, expect, it} from 'vitest';
import {
  HelpOverlay,
  KeyHints,
  KeymapProvider,
  keyLayers,
  useKeybindings,
} from '../src/keys/index.js';
import {tick} from './helpers.js';

const Counter = () => {
  const [count, setCount] = useState(0);
  const [help, setHelp] = useState(false);
  useKeybindings([
    {keys: '+', description: 'Increment', group: 'Counter', run: () => setCount(count + 1)},
    {keys: '?', description: 'Help', run: () => setHelp(true)},
  ]);
  return (
    <>
      <Text>count {count}</Text>
      <KeyHints />
      {help ? <HelpOverlay onClose={() => setHelp(false)} /> : null}
    </>
  );
};

describe('keymap components', () => {
  it('routes keys to handlers that see the latest state', async () => {
    const view = render(
      <KeymapProvider>
        <Counter />
      </KeymapProvider>,
    );
    await tick();
    view.stdin.write('+');
    await tick();
    view.stdin.write('+');
    await tick();
    expect(view.lastFrame()).toContain('count 2');
    expect(view.lastFrame()).toContain('+ increment · ? help');
  });

  it('opens help, captures keys while open, and closes on Escape', async () => {
    const view = render(
      <KeymapProvider>
        <Counter />
      </KeymapProvider>,
    );
    await tick();
    view.stdin.write('?');
    await tick();
    expect(view.lastFrame()).toContain('Keyboard');
    expect(view.lastFrame()).toContain('Counter');
    view.stdin.write('+');
    await tick();
    expect(view.lastFrame()).toContain('count 0');
    view.stdin.write('\u001B');
    await tick();
    await tick();
    expect(view.lastFrame()).not.toContain('Keyboard');
  });

  it('removes inactive bindings', async () => {
    const Toggle = ({active}: {active: boolean}) => {
      useKeybindings([{keys: 'x', description: 'Explode', run: () => undefined}], {
        active,
        layer: keyLayers.pane,
      });
      return <KeyHints />;
    };
    const view = render(
      <KeymapProvider>
        <Toggle active />
      </KeymapProvider>,
    );
    await tick();
    expect(view.lastFrame()).toContain('explode');
    view.rerender(
      <KeymapProvider>
        <Toggle active={false} />
      </KeymapProvider>,
    );
    await tick();
    expect(view.lastFrame()).not.toContain('explode');
  });
});
