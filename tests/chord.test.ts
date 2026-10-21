import type {Key} from 'ink';
import {describe, expect, it} from 'vitest';
import {chordFromInput, chordsEqual, formatKeySpec, parseKeySpec} from '../src/keys/index.js';
import {keyOf, noKey} from './helpers.js';

const matches = (spec: string, input: string, key: Partial<Key> = {}): boolean => {
  const chord = chordFromInput(input, keyOf(key));
  return chord !== undefined && chordsEqual(parseKeySpec(spec), chord);
};

describe('key specs', () => {
  it('parses modifiers, named keys, and aliases', () => {
    expect(parseKeySpec('Ctrl+S')).toEqual({key: 's', ctrl: true, meta: false, shift: false});
    expect(parseKeySpec('alt+pgdn')).toMatchObject({key: 'pagedown', meta: true});
    expect(parseKeySpec('shift+tab')).toMatchObject({key: 'tab', shift: true});
    expect(parseKeySpec('space').key).toBe(' ');
    expect(parseKeySpec('ctrl++')).toMatchObject({key: '+', ctrl: true});
  });

  it('treats shifted letters and capitals as the same chord', () => {
    expect(parseKeySpec('shift+q')).toEqual(parseKeySpec('Q'));
  });

  it('rejects unknown keys and modifiers', () => {
    expect(() => parseKeySpec('hyper+x')).toThrow('Unknown modifier');
    expect(() => parseKeySpec('ctrl+banana')).toThrow('Unknown key');
    expect(() => parseKeySpec('')).toThrow('empty');
  });

  it('formats specs for help screens', () => {
    expect(formatKeySpec('ctrl+s')).toBe('Ctrl+S');
    expect(formatKeySpec('shift+tab')).toBe('Shift+Tab');
    expect(formatKeySpec('pagedown')).toBe('PgDn');
    expect(formatKeySpec('?')).toBe('?');
  });
});

describe('terminal input', () => {
  it('matches what Ink reports for common keys', () => {
    expect(matches('ctrl+s', 's', {ctrl: true})).toBe(true);
    expect(matches('shift+tab', '', {tab: true, shift: true})).toBe(true);
    expect(matches('tab', '', {tab: true, shift: true})).toBe(false);
    expect(matches('Q', 'Q', {shift: true})).toBe(true);
    expect(matches('q', 'Q', {shift: true})).toBe(false);
    expect(matches('?', '?', {shift: true})).toBe(true);
    expect(matches('alt+x', 'x', {meta: true})).toBe(true);
  });

  it('ignores pasted text', () => {
    expect(chordFromInput('hello', noKey)).toBeUndefined();
  });
});
