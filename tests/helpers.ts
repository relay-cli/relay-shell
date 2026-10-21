import type {Key} from 'ink';

export const noKey: Key = {
  upArrow: false,
  downArrow: false,
  leftArrow: false,
  rightArrow: false,
  pageDown: false,
  pageUp: false,
  home: false,
  end: false,
  return: false,
  escape: false,
  ctrl: false,
  shift: false,
  tab: false,
  backspace: false,
  delete: false,
  meta: false,
  super: false,
  hyper: false,
  capsLock: false,
  numLock: false,
};

export const keyOf = (key: Partial<Key> = {}): Key => ({...noKey, ...key});

/** Give Ink a moment to read stdin and re-render. */
export const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 20));
