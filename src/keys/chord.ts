import type {Key} from 'ink';

/** One key press, normalized so that specs and terminal input compare equal. */
export interface KeyChord {
  /** A named key such as `tab` or `pageup`, or the printable character itself. */
  key: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
}

const namedKeys = new Map<string, string>([
  ['up', 'up'],
  ['down', 'down'],
  ['left', 'left'],
  ['right', 'right'],
  ['pageup', 'pageup'],
  ['pgup', 'pageup'],
  ['pagedown', 'pagedown'],
  ['pgdn', 'pagedown'],
  ['home', 'home'],
  ['end', 'end'],
  ['enter', 'enter'],
  ['return', 'enter'],
  ['escape', 'escape'],
  ['esc', 'escape'],
  ['tab', 'tab'],
  ['backspace', 'backspace'],
  ['delete', 'delete'],
  ['space', ' '],
]);

const modifierNames = new Map<string, 'ctrl' | 'meta' | 'shift'>([
  ['ctrl', 'ctrl'],
  ['control', 'ctrl'],
  ['meta', 'meta'],
  ['alt', 'meta'],
  ['option', 'meta'],
  ['shift', 'shift'],
]);

const isLetter = (value: string): boolean => /^[a-z]$/i.test(value);

const segmenter = new Intl.Segmenter();

/** One user-perceived character, so an emoji with modifiers still counts as one key. */
const isSingleCharacter = (value: string): boolean => {
  const segments = segmenter.segment(value)[Symbol.iterator]();
  return segments.next().done === false && segments.next().done === true;
};

/**
 * Parse a key spec such as `q`, `?`, `ctrl+s`, `shift+tab`, or `pagedown`.
 *
 * Printable characters are case-sensitive: `Q` and `shift+q` are the same
 * chord. `ctrl+` combinations ignore case because terminals cannot report it.
 */
export const parseKeySpec = (spec: string): KeyChord => {
  const trimmed = spec.trim();
  if (trimmed.length === 0) throw new Error('A key spec cannot be empty.');
  // A trailing "+" is the plus key itself, as in "ctrl++".
  const parts = trimmed.endsWith('++')
    ? [...trimmed.slice(0, -2).split('+'), '+']
    : trimmed === '+'
      ? ['+']
      : trimmed.split('+');
  const chord: KeyChord = {key: '', ctrl: false, meta: false, shift: false};
  for (const [index, part] of parts.entries()) {
    const last = index === parts.length - 1;
    const lower = part.toLowerCase();
    if (!last) {
      const modifier = modifierNames.get(lower);
      if (modifier === undefined) throw new Error(`Unknown modifier "${part}" in "${spec}".`);
      chord[modifier] = true;
      continue;
    }
    const named = namedKeys.get(lower);
    if (named !== undefined && part.length > 1) chord.key = named;
    else if (isSingleCharacter(part)) chord.key = part;
    else throw new Error(`Unknown key "${part}" in "${spec}".`);
  }
  return normalizeChord(chord);
};

const normalizeChord = (chord: KeyChord): KeyChord => {
  // Symbols such as "?" already carry Shift in the character itself.
  if (isSingleCharacter(chord.key) && !isLetter(chord.key)) return {...chord, shift: false};
  if (!isLetter(chord.key)) return chord;
  if (chord.ctrl) return {...chord, key: chord.key.toLowerCase()};
  if (chord.shift) return {...chord, key: chord.key.toUpperCase(), shift: false};
  if (chord.key === chord.key.toUpperCase()) return {...chord, shift: false};
  return chord;
};

/** Convert Ink's `useInput` arguments into a chord, or `undefined` for pasted text. */
export const chordFromInput = (input: string, key: Key): KeyChord | undefined => {
  const base = {ctrl: key.ctrl, meta: key.meta, shift: key.shift};
  if (key.upArrow) return {...base, key: 'up'};
  if (key.downArrow) return {...base, key: 'down'};
  if (key.leftArrow) return {...base, key: 'left'};
  if (key.rightArrow) return {...base, key: 'right'};
  if (key.pageUp) return {...base, key: 'pageup'};
  if (key.pageDown) return {...base, key: 'pagedown'};
  if (key.home) return {...base, key: 'home'};
  if (key.end) return {...base, key: 'end'};
  if (key.return) return {...base, key: 'enter'};
  if (key.escape) return {...base, key: 'escape'};
  if (key.tab) return {...base, key: 'tab'};
  if (key.backspace) return {...base, key: 'backspace'};
  if (key.delete) return {...base, key: 'delete'};
  if (!isSingleCharacter(input)) return undefined;
  return normalizeChord({...base, key: input});
};

export const chordsEqual = (left: KeyChord, right: KeyChord): boolean =>
  left.key === right.key &&
  left.ctrl === right.ctrl &&
  left.meta === right.meta &&
  left.shift === right.shift;

const keyLabels = new Map<string, string>([
  ['up', '↑'],
  ['down', '↓'],
  ['left', '←'],
  ['right', '→'],
  ['pageup', 'PgUp'],
  ['pagedown', 'PgDn'],
  ['home', 'Home'],
  ['end', 'End'],
  ['enter', 'Enter'],
  ['escape', 'Esc'],
  ['tab', 'Tab'],
  ['backspace', 'Backspace'],
  ['delete', 'Delete'],
  [' ', 'Space'],
]);

/** A short label for help screens and status hints, such as `Ctrl+S` or `Shift+Tab`. */
export const formatChord = (chord: KeyChord): string => {
  const parts: string[] = [];
  if (chord.ctrl) parts.push('Ctrl');
  if (chord.meta) parts.push('Alt');
  if (chord.shift) parts.push('Shift');
  const label = keyLabels.get(chord.key) ?? chord.key;
  parts.push(chord.ctrl && isLetter(chord.key) ? label.toUpperCase() : label);
  return parts.join('+');
};

export const formatKeySpec = (spec: string): string => formatChord(parseKeySpec(spec));
