import type {Key} from 'ink';
import {describe, expect, it, vi} from 'vitest';
import {KeyRegistry, keyLayers} from '../src/keys/index.js';
import {keyOf} from './helpers.js';

const press = (registry: KeyRegistry, input: string, key: Partial<Key> = {}): boolean =>
  registry.dispatch(input, keyOf(key));

describe('KeyRegistry', () => {
  it('asks higher layers first and stops at the first handler', () => {
    const registry = new KeyRegistry();
    const global = vi.fn();
    const pane = vi.fn();
    registry.register([{keys: 'j', run: global}]);
    registry.register([{keys: 'j', run: pane}], {layer: keyLayers.pane});
    expect(press(registry, 'j')).toBe(true);
    expect(pane).toHaveBeenCalledOnce();
    expect(global).not.toHaveBeenCalled();
  });

  it('prefers the most recent set within a layer', () => {
    const registry = new KeyRegistry();
    const first = vi.fn();
    const second = vi.fn();
    registry.register([{keys: 'x', run: first}]);
    registry.register([{keys: 'x', run: second}]);
    press(registry, 'x');
    expect(second).toHaveBeenCalledOnce();
    expect(first).not.toHaveBeenCalled();
  });

  it('passes a key on when a handler returns false', () => {
    const registry = new KeyRegistry();
    const global = vi.fn();
    registry.register([{keys: 'enter', run: global}]);
    registry.register([{keys: 'enter', run: () => false}], {layer: keyLayers.pane});
    press(registry, '', {return: true});
    expect(global).toHaveBeenCalledOnce();
  });

  it('lets exclusive sets block lower layers', () => {
    const registry = new KeyRegistry();
    const quit = vi.fn();
    registry.register([{keys: 'q', run: quit}]);
    const dialog = registry.register([{keys: 'escape', run: vi.fn()}], {
      layer: keyLayers.overlay,
      exclusive: true,
    });
    expect(press(registry, 'q')).toBe(false);
    expect(quit).not.toHaveBeenCalled();
    registry.unregister(dialog);
    press(registry, 'q');
    expect(quit).toHaveBeenCalledOnce();
  });

  it('offers unmatched keys to a fallback such as a text field', () => {
    const registry = new KeyRegistry();
    const typed: string[] = [];
    const global = vi.fn();
    registry.register([{keys: 'q', run: global}]);
    registry.register([{keys: 'enter', run: vi.fn()}], {
      layer: keyLayers.pane,
      fallback: (input) => {
        typed.push(input);
        return true;
      },
    });
    press(registry, 'q');
    press(registry, 'hello');
    expect(typed).toEqual(['q', 'hello']);
    expect(global).not.toHaveBeenCalled();
  });

  it('lists reachable bindings without shadowed duplicates', () => {
    const registry = new KeyRegistry();
    registry.register([
      {keys: ['q', 'ctrl+c'], description: 'Quit', group: 'App', run: vi.fn()},
      {keys: 'j', description: 'Global down', run: vi.fn()},
      {keys: 'r', run: vi.fn()},
    ]);
    registry.register([{keys: ['j', 'down'], description: 'Next row', run: vi.fn()}], {
      layer: keyLayers.pane,
    });
    expect(registry.list().map((hint) => [hint.keys, hint.description])).toEqual([
      ['j / ↓', 'Next row'],
      ['q / Ctrl+C', 'Quit'],
    ]);
  });

  it('hides keys beneath a dialog that lists its own', () => {
    const registry = new KeyRegistry();
    registry.register([{keys: 'q', description: 'Quit', run: vi.fn()}]);
    registry.register([{keys: 'escape', run: vi.fn()}], {
      layer: keyLayers.overlay,
      exclusive: true,
    });
    expect(registry.list().map((hint) => hint.description)).toEqual(['Quit']);
    registry.register([{keys: 'y', description: 'Confirm', run: vi.fn()}], {
      layer: keyLayers.overlay,
      exclusive: true,
    });
    expect(registry.list().map((hint) => hint.description)).toEqual(['Confirm']);
  });

  it('notifies subscribers only when the listed bindings change', () => {
    const registry = new KeyRegistry();
    const listener = vi.fn();
    registry.subscribe(listener);
    const id = registry.register([{keys: 'a', description: 'Add', run: vi.fn()}]);
    expect(listener).toHaveBeenCalledTimes(1);
    registry.update(id, [{keys: 'a', description: 'Add', run: vi.fn()}]);
    expect(listener).toHaveBeenCalledTimes(1);
    registry.update(id, [{keys: 'a', description: 'Append', run: vi.fn()}]);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
